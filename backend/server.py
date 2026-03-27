from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jose import jwt, JWTError
import shutil
from io import BytesIO
from PIL import Image
import asyncio

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass
import re
import cloudinary
import cloudinary.uploader

from .site_content import init_site_content, register_site_content_routes, seed_mongo_if_empty


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
db = client[os.environ['DB_NAME']]
MONGO_AVAILABLE = False

# Fallback store to keep admin event management working without MongoDB.
in_memory_events: Dict[str, dict] = {}

# SMTP configuration
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASS = os.environ.get('SMTP_PASS', '')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL', '')

# Auth configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Cloudinary — use the SDK URL parser (manual urlparse can mis-read some secrets / cloud names).


def _normalize_cloudinary_url(raw: str) -> str:
    """Strip whitespace; allow pasting `CLOUDINARY_URL=cloudinary://...` from docs by mistake."""
    t = (raw or "").strip()
    if not t:
        return ""
    if t.upper().startswith("CLOUDINARY_URL="):
        t = t.split("=", 1)[1].strip()
    return t.strip('"').strip("'")


CLOUDINARY_URL = _normalize_cloudinary_url(os.environ.get("CLOUDINARY_URL", ""))
if CLOUDINARY_URL:
    # Official SDK parsing — more reliable than urllib.parse for cloudinary:// URLs.
    cloudinary.config(cloudinary_url=CLOUDINARY_URL, secure=True)
else:
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip(),
        api_key=os.environ.get("CLOUDINARY_API_KEY", "").strip(),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET", "").strip(),
        secure=True,
    )


def _cloudinary_ready() -> bool:
    cfg = cloudinary.config()
    # cloudinary>=1.44: CLOUDINARY_URL sets only `cloudinary_url` on Config, not cloud_name/api_key fields.
    url = getattr(cfg, "cloudinary_url", None) or ""
    if str(url).strip():
        return True
    return bool(cfg.cloud_name and cfg.api_key and cfg.api_secret)


# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if not _cloudinary_ready():
    logger.warning(
        "Cloudinary is not configured: set CLOUDINARY_URL on the server (Dashboard → API Keys → "
        "copy the full env value), or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and "
        "CLOUDINARY_API_SECRET. Admin uploads will return 500 until this is set."
    )
else:
    _cfg = cloudinary.config()
    _label = _cfg.cloud_name or (
        _cfg.cloudinary_url.split("@")[-1] if getattr(_cfg, "cloudinary_url", None) else "?"
    )
    logger.info("Cloudinary ready (cloud_name=%s)", _label)


# ===== MODELS =====

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    month: str
    year: str = ""
    location: str = ""
    price: str = ""
    image: str = ""
    full_date: str = ""

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    month: Optional[str] = None
    year: Optional[str] = None
    location: Optional[str] = None
    price: Optional[str] = None
    image: Optional[str] = None
    full_date: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: str
    month: str
    year: str
    location: str
    price: str
    image: str
    full_date: str
    created_at: str
    updated_at: str

class JoinClassRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    dance_style: Optional[str] = ""
    message: Optional[str] = ""

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: Optional[str] = ""
    message: str

class NewsletterRequest(BaseModel):
    email: str


# ===== AUTH HELPERS =====

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ===== EMAIL HELPER =====

async def send_email(subject: str, html_body: str, recipient: str = None):
    to_email = recipient or RECIPIENT_EMAIL
    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))
    try:
        await aiosmtplib.send(
            msg, hostname=SMTP_HOST, port=SMTP_PORT,
            start_tls=True, username=SMTP_USER, password=SMTP_PASS,
        )
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Email failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# ===== AUTH ROUTES =====

@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(request: LoginRequest):
    if request.username != ADMIN_USERNAME or request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": request.username})
    return LoginResponse(access_token=token, username=request.username)


@api_router.get("/admin/verify")
async def verify_admin(username: str = Depends(verify_token)):
    return {"valid": True, "username": username}


def _normalize_upload_content_type(upload: UploadFile) -> str:
    """Browsers sometimes omit MIME or send octet-stream for HEIC/HEIF."""
    ct = (upload.content_type or "").strip().lower()
    fn = (upload.filename or "").lower()
    if ct in ("", "application/octet-stream", "binary/octet-stream"):
        if fn.endswith(".heic"):
            return "image/heic"
        if fn.endswith(".heif"):
            return "image/heif"
    return ct or "application/octet-stream"


def extract_cloudinary_public_id(url: str) -> Optional[str]:
    if "res.cloudinary.com" not in url:
        return None
    # Example URL:
    # https://res.cloudinary.com/<cloud>/image/upload/v123456/events/abc.webp
    match = re.search(r"/upload/(?:v\d+/)?(.+)$", url)
    if not match:
        return None
    public_with_ext = match.group(1).split("?")[0]
    public_id = re.sub(r"\.[^./]+$", "", public_with_ext)
    return public_id


def _compress_image_bytes_for_cloudinary(
    contents: bytes,
    *,
    max_side: Optional[int] = None,
    quality: Optional[int] = None,
) -> bytes:
    """
    Resize and re-encode raster images before Cloudinary (smaller bills than uploading originals).
    GIF uses first frame only; output is WebP.
    """
    max_side = max_side or int(os.environ.get("IMAGE_UPLOAD_MAX_SIDE", "1280"))
    quality = quality or int(os.environ.get("IMAGE_UPLOAD_WEBP_QUALITY", "72"))
    max_side = max(320, min(max_side, 4096))
    quality = max(30, min(quality, 95))

    with Image.open(BytesIO(contents)) as img:
        if getattr(img, "is_animated", False):
            img.seek(0)
        if img.mode in ("RGBA", "LA"):
            img = img.convert("RGBA")
        elif img.mode == "P" and "transparency" in img.info:
            img = img.convert("RGBA")
        elif img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        if img.mode == "L":
            img = img.convert("RGB")

        img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        buf = BytesIO()
        img.save(buf, format="WEBP", quality=quality, method=6)
        return buf.getvalue()


async def delete_cloudinary_asset_by_url(url: str):
    public_id = extract_cloudinary_public_id(url)
    if not public_id:
        return
    # Try image first, then video.
    await asyncio.to_thread(cloudinary.uploader.destroy, public_id, resource_type="image", invalidate=True)
    await asyncio.to_thread(cloudinary.uploader.destroy, public_id, resource_type="video", invalidate=True)


# ===== EVENT ROUTES =====

@api_router.get("/events", response_model=List[EventResponse])
async def get_events():
    if MONGO_AVAILABLE:
        events = await db.events.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return events
    events = sorted(in_memory_events.values(), key=lambda e: e["created_at"], reverse=True)
    return events


@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    if MONGO_AVAILABLE:
        event = await db.events.find_one({"id": event_id}, {"_id": 0})
    else:
        event = in_memory_events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@api_router.post("/events", response_model=EventResponse)
async def create_event(event: EventCreate, username: str = Depends(verify_token)):
    now = datetime.now(timezone.utc).isoformat()
    event_doc = {
        "id": str(uuid.uuid4()),
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "month": event.month,
        "year": event.year or str(datetime.now().year),
        "location": event.location,
        "price": event.price,
        "image": event.image,
        "full_date": event.full_date,
        "created_at": now,
        "updated_at": now,
    }
    if MONGO_AVAILABLE:
        await db.events.insert_one(event_doc)
    else:
        in_memory_events[event_doc["id"]] = event_doc
    event_doc.pop("_id", None)
    logger.info(f"Event created: {event_doc['title']}")
    return event_doc


@api_router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event: EventUpdate, username: str = Depends(verify_token)):
    if MONGO_AVAILABLE:
        existing = await db.events.find_one({"id": event_id})
    else:
        existing = in_memory_events.get(event_id)
    if not existing:
        if MONGO_AVAILABLE:
            raise HTTPException(status_code=404, detail="Event not found")
        # Fallback mode: treat update as upsert so edits keep working
        # even after backend restarts without MongoDB persistence.
        now = datetime.now(timezone.utc).isoformat()
        new_event = {
            "id": event_id,
            "title": event.title or "Untitled Event",
            "description": event.description or "",
            "date": event.date or "",
            "month": event.month or "",
            "year": event.year or str(datetime.now().year),
            "location": event.location or "",
            "price": event.price or "",
            "image": event.image or "",
            "full_date": event.full_date or "",
            "created_at": now,
            "updated_at": now,
        }
        in_memory_events[event_id] = new_event
        logger.info(f"Event upserted in fallback mode: {event_id}")
        return new_event

    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    if MONGO_AVAILABLE:
        await db.events.update_one({"id": event_id}, {"$set": update_data})
        updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    else:
        existing.update(update_data)
        in_memory_events[event_id] = existing
        updated = existing
    logger.info(f"Event updated: {event_id}")
    return updated


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, username: str = Depends(verify_token)):
    if MONGO_AVAILABLE:
        existing = await db.events.find_one({"id": event_id})
    else:
        existing = in_memory_events.get(event_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete associated asset from Cloudinary if exists.
    if existing.get("image"):
        try:
            await delete_cloudinary_asset_by_url(existing["image"])
        except Exception as e:
            logger.warning(f"Failed to remove Cloudinary asset for event {event_id}: {str(e)}")

    if MONGO_AVAILABLE:
        await db.events.delete_one({"id": event_id})
    else:
        in_memory_events.pop(event_id, None)
    logger.info(f"Event deleted: {event_id}")
    return {"success": True, "message": "Event deleted successfully"}


# ===== UPLOAD ROUTES =====

@api_router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("events"),
    username: str = Depends(verify_token),
):
    if not _cloudinary_ready():
        raise HTTPException(status_code=500, detail="Cloudinary is not configured on server")

    content_type = _normalize_upload_content_type(file)

    # Validate file type
    allowed_types = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "image/heic", "image/heif",
        "video/mp4", "video/webm", "video/quicktime",
    ]
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC/HEIF, MP4, WEBM, MOV",
        )

    contents = await file.read()

    is_image = content_type.startswith("image/")
    if is_image:
        # Allow larger *original* images; we compress before Cloudinary.
        max_raw_mb = float(os.environ.get("UPLOAD_MAX_IMAGE_RAW_MB", "30"))
        max_raw_bytes = int(max_raw_mb * 1024 * 1024)
    else:
        # Keep a conservative raw limit for videos.
        max_raw_mb = float(os.environ.get("UPLOAD_MAX_VIDEO_RAW_MB", "10"))
        max_raw_bytes = int(max_raw_mb * 1024 * 1024)

    if len(contents) > max_raw_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {max_raw_mb:g}MB",
        )

    processed_contents = contents
    if is_image:
        # Target smaller payloads (KB/low-MB) before uploading to Cloudinary.
        # If the first pass is still too big, we retry more aggressively.
        max_processed_mb = float(os.environ.get("UPLOAD_MAX_IMAGE_PROCESSED_MB", "2"))
        max_processed_bytes = int(max_processed_mb * 1024 * 1024)

        try:
            processed_contents = _compress_image_bytes_for_cloudinary(contents)

            retry_passes = [
                # (max_side, quality) - decreasing resolution + quality
                (1024, 65),
                (768, 55),
                (512, 45),
                (384, 35),
            ]

            if len(processed_contents) > max_processed_bytes:
                for ms, q in retry_passes:
                    processed_contents = _compress_image_bytes_for_cloudinary(
                        contents,
                        max_side=ms,
                        quality=q,
                    )
                    if len(processed_contents) <= max_processed_bytes:
                        break

            logger.info(
                "Compressed image before Cloudinary: %s bytes -> %s bytes (limit %s bytes)",
                len(contents),
                len(processed_contents),
                max_processed_bytes,
            )
        except Exception as e:
            logger.warning("Image compression failed, uploading raw bytes: %s", e)
            processed_contents = contents

        if len(processed_contents) > max_processed_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large even after compression. Max: {max_processed_mb:g}MB",
            )
    resource_type = "video" if content_type.startswith("video/") else "image"
    cld_folder = (folder or "events").strip().lower().replace("/", "").replace("\\", "")
    if cld_folder not in ("events", "gallery"):
        cld_folder = "events"
    try:
        upload_result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            processed_contents,
            folder=cld_folder,
            resource_type=resource_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    media_url = upload_result.get("secure_url")
    public_id = upload_result.get("public_id")
    logger.info(f"Media uploaded to Cloudinary: {public_id}")
    return {"success": True, "url": media_url, "public_id": public_id, "resource_type": resource_type}


@api_router.delete("/uploads/{asset_path:path}")
async def delete_upload(asset_path: str, username: str = Depends(verify_token)):
    if not _cloudinary_ready():
        raise HTTPException(status_code=500, detail="Cloudinary is not configured on server")
    public_id = re.sub(r"\.[^./]+$", "", asset_path)
    await asyncio.to_thread(cloudinary.uploader.destroy, public_id, resource_type="image", invalidate=True)
    await asyncio.to_thread(cloudinary.uploader.destroy, public_id, resource_type="video", invalidate=True)
    return {"success": True, "message": "Cloudinary asset deleted"}


# ===== FORM ROUTES =====

@api_router.post("/join-class")
async def join_class(request: JoinClassRequest):
    html_body = f"""
    <html><body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #111; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0;">Dance Academy</h1>
            <p style="color: #ccc;">New Class Registration</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #111;">New Join Class Request</h2>
            <p><b>Name:</b> {request.name}</p>
            <p><b>Email:</b> {request.email}</p>
            <p><b>Phone:</b> {request.phone or 'Not provided'}</p>
            <p><b>Dance Style:</b> {request.dance_style or 'Not specified'}</p>
            <p><b>Message:</b> {request.message or 'No message'}</p>
        </div>
    </body></html>
    """
    await send_email(subject=f"New Class Registration - {request.name}", html_body=html_body)
    doc = request.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), "type": "join_class"})
    await db.form_submissions.insert_one(doc)
    return {"success": True, "message": "Registration submitted successfully!"}


@api_router.post("/contact")
async def contact_form(request: ContactRequest):
    html_body = f"""
    <html><body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #111; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0;">Dance Academy</h1>
            <p style="color: #ccc;">Contact Form Message</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #111;">New Contact Message</h2>
            <p><b>Name:</b> {request.name}</p>
            <p><b>Email:</b> {request.email}</p>
            <p><b>Subject:</b> {request.subject or 'No subject'}</p>
            <p><b>Message:</b> {request.message}</p>
        </div>
    </body></html>
    """
    await send_email(subject=f"Contact: {request.subject or 'New Message'} - {request.name}", html_body=html_body)
    doc = request.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), "type": "contact"})
    await db.form_submissions.insert_one(doc)
    return {"success": True, "message": "Message sent successfully!"}


@api_router.post("/newsletter")
async def newsletter_subscribe(request: NewsletterRequest):
    html_body = f"""
    <html><body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #111; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0;">Dance Academy</h1>
            <p style="color: #ccc;">Newsletter Subscription</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>New subscriber: <strong>{request.email}</strong></p>
        </div>
    </body></html>
    """
    await send_email(subject=f"New Newsletter Subscriber - {request.email}", html_body=html_body)
    doc = {"email": request.email, "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), "type": "newsletter"}
    await db.form_submissions.insert_one(doc)
    return {"success": True, "message": "Subscribed successfully!"}


@api_router.get("/")
async def root():
    return {"message": "Dance Academy API"}


register_site_content_routes(api_router, verify_token)

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create indexes on startup (Mongo availability is decided by ping, not index creation)
@app.on_event("startup")
async def startup_db():
    global MONGO_AVAILABLE
    MONGO_AVAILABLE = False
    try:
        await client.admin.command("ping")
        MONGO_AVAILABLE = True
        logger.info("MongoDB ping OK")
    except Exception as e:
        logger.warning(
            "MongoDB unreachable on startup. CMS data (including gallery) will use in-memory storage "
            "and will reset when the server restarts — uploads still go to Cloudinary. Fix MONGO_URL/DB. Error: %s",
            str(e),
        )

    if MONGO_AVAILABLE:
        try:
            await db.events.create_index("id", unique=True)
            await db.events.create_index("created_at")
            for coll in ("dance_school_items", "gallery_items", "instructors", "blog_posts", "testimonials"):
                try:
                    await db[coll].create_index("id", unique=True)
                except Exception:
                    pass
            logger.info("Database indexes created")
        except Exception as e:
            logger.warning("Index creation warning (continuing): %s", str(e))

    init_site_content(db, MONGO_AVAILABLE)
    await seed_mongo_if_empty()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
