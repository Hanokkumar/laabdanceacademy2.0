from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jose import jwt, JWTError
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

# Upload config
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

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


# ===== EVENT ROUTES =====

@api_router.get("/events", response_model=List[EventResponse])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return events


@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
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
    await db.events.insert_one(event_doc)
    event_doc.pop("_id", None)
    logger.info(f"Event created: {event_doc['title']}")
    return event_doc


@api_router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event: EventUpdate, username: str = Depends(verify_token)):
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.events.update_one({"id": event_id}, {"$set": update_data})
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    logger.info(f"Event updated: {event_id}")
    return updated


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, username: str = Depends(verify_token)):
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete associated image if exists
    if existing.get("image") and existing["image"].startswith("/api/uploads/"):
        filename = existing["image"].split("/")[-1]
        filepath = UPLOAD_DIR / filename
        if filepath.exists():
            filepath.unlink()

    await db.events.delete_one({"id": event_id})
    logger.info(f"Event deleted: {event_id}")
    return {"success": True, "message": "Event deleted successfully"}


# ===== UPLOAD ROUTES =====

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), username: str = Depends(verify_token)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, GIF, WebP")

    # Limit file size (10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max: 10MB")

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/api/uploads/{filename}"
    logger.info(f"Image uploaded: {filename}")
    return {"success": True, "url": image_url, "filename": filename}


@api_router.delete("/uploads/{filename}")
async def delete_upload(filename: str, username: str = Depends(verify_token)):
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    filepath.unlink()
    return {"success": True, "message": "File deleted"}


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


# Include the router
app.include_router(api_router)

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create indexes on startup
@app.on_event("startup")
async def startup_db():
    await db.events.create_index("id", unique=True)
    await db.events.create_index("created_at")
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
