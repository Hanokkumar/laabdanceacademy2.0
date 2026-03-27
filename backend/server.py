from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


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

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

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


# Email sending utility
async def send_email(subject: str, html_body: str, recipient: str = None):
    """Send email using aiosmtplib"""
    to_email = recipient or RECIPIENT_EMAIL
    
    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))
    
    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASS,
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Dance Academy API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/join-class")
async def join_class(request: JoinClassRequest):
    """Handle Join Class form submission - sends email"""
    html_body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="background: linear-gradient(135deg, #111 0%, #222 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0; font-size: 28px;">Dance Academy</h1>
            <p style="color: #ccc; margin-top: 8px;">New Class Registration</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #111; margin-top: 0;">New Join Class Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555; width: 140px;">Name:</td>
                    <td style="padding: 12px 0; color: #111;">{request.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 12px 0; color: #111;">{request.email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 12px 0; color: #111;">{request.phone or 'Not provided'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555;">Dance Style:</td>
                    <td style="padding: 12px 0; color: #111;">{request.dance_style or 'Not specified'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
                    <td style="padding: 12px 0; color: #111;">{request.message or 'No message'}</td>
                </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #fff5f5; border-left: 4px solid #ff4c4c; border-radius: 4px;">
                <p style="margin: 0; color: #666; font-size: 13px;">This registration was submitted via the Dance Academy website.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(
        subject=f"New Class Registration - {request.name}",
        html_body=html_body
    )
    
    # Save to database
    doc = request.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = datetime.now(timezone.utc).isoformat()
    doc['type'] = 'join_class'
    await db.form_submissions.insert_one(doc)
    
    return {"success": True, "message": "Registration submitted successfully! We'll get back to you soon."}


@api_router.post("/contact")
async def contact_form(request: ContactRequest):
    """Handle Contact form submission - sends email"""
    html_body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="background: linear-gradient(135deg, #111 0%, #222 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0; font-size: 28px;">Dance Academy</h1>
            <p style="color: #ccc; margin-top: 8px;">Contact Form Message</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #111; margin-top: 0;">New Contact Message</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555; width: 120px;">Name:</td>
                    <td style="padding: 12px 0; color: #111;">{request.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 12px 0; color: #111;">{request.email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0; font-weight: bold; color: #555;">Subject:</td>
                    <td style="padding: 12px 0; color: #111;">{request.subject or 'No subject'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
                    <td style="padding: 12px 0; color: #111;">{request.message}</td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    
    await send_email(
        subject=f"Contact: {request.subject or 'New Message'} - {request.name}",
        html_body=html_body
    )
    
    doc = request.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = datetime.now(timezone.utc).isoformat()
    doc['type'] = 'contact'
    await db.form_submissions.insert_one(doc)
    
    return {"success": True, "message": "Message sent successfully! We'll respond shortly."}


@api_router.post("/newsletter")
async def newsletter_subscribe(request: NewsletterRequest):
    """Handle Newsletter subscription - sends confirmation email"""
    html_body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="background: linear-gradient(135deg, #111 0%, #222 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ff4c4c; margin: 0; font-size: 28px;">Dance Academy</h1>
            <p style="color: #ccc; margin-top: 8px;">Newsletter Subscription</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #111; margin-top: 0;">New Newsletter Subscriber</h2>
            <p style="color: #555;">Email: <strong>{request.email}</strong></p>
        </div>
    </body>
    </html>
    """
    
    await send_email(
        subject=f"New Newsletter Subscriber - {request.email}",
        html_body=html_body
    )
    
    doc = {"email": request.email, "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), "type": "newsletter"}
    await db.form_submissions.insert_one(doc)
    
    return {"success": True, "message": "Subscribed successfully!"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
