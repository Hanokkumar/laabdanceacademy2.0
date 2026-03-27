"""
Site-wide CMS content: dance school, gallery, instructors, schedule, blog, testimonials.
Mirrors frontend mockData defaults; supports MongoDB when available, else in-memory (like events).
"""
from __future__ import annotations

import asyncio
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Set

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

# Set by init_site_content()
DB = None
MONGO_AVAILABLE = False

# In-memory fallback
_im_categories: List[str] = []
_im_dance_items: Dict[str, dict] = {}
_im_gallery: Dict[str, dict] = {}
_im_instructors: Dict[str, dict] = {}
_im_blog: Dict[str, dict] = {}
_im_testimonials: Dict[str, dict] = {}
_im_schedule_rows: List[dict] = []
_seeded_memory = False

BASE_IMG = "https://demo.kamleshyadav.com/themeforest/dance-academy/demo-v1/wp-content/uploads/sites/2"

DEFAULT_CATEGORIES = [
    "All",
    "Ballet",
    "Belly",
    "Contemporary",
    "Hip Hop",
    "Irish",
    "Jazz",
    "Kathak",
    "Modern",
    "Salsa",
    "Tap",
]

DEFAULT_DANCE_ITEMS = [
    {
        "id": "ds-1",
        "image": f"{BASE_IMG}/2016/11/da-sc-5-1.png",
        "title": "London",
        "category": "Modern",
        "tags": ["Ballet", "Belly", "Contemporary", "Hip Hop", "Irish", "Modern"],
    },
    {
        "id": "ds-2",
        "image": f"{BASE_IMG}/2016/11/da-sc-2-1.png",
        "title": "China",
        "category": "Modern",
        "tags": ["Contemporary", "Hip Hop", "Irish", "Jazz", "Kathak", "Modern"],
    },
    {
        "id": "ds-3",
        "image": f"{BASE_IMG}/2016/11/da-sc-6-1.png",
        "title": "Australia",
        "category": "Tap",
        "tags": ["Ballet", "Belly", "Irish", "Jazz", "Salsa", "Tap"],
    },
    {
        "id": "ds-4",
        "image": f"{BASE_IMG}/2016/11/da-sc-4-1.png",
        "title": "India",
        "category": "Tap",
        "tags": ["Ballet", "Belly", "Contemporary", "Hip Hop", "Modern", "Salsa", "Tap"],
    },
    {
        "id": "ds-5",
        "image": f"{BASE_IMG}/2016/11/da-sc-3-1.png",
        "title": "New York",
        "category": "Salsa",
        "tags": ["Hip Hop", "Irish", "Modern", "Salsa"],
    },
    {
        "id": "ds-6",
        "image": f"{BASE_IMG}/2016/11/da-sc-6-1.png",
        "title": "Brazil",
        "category": "Salsa",
        "tags": ["Ballet", "Belly", "Contemporary", "Hip Hop", "Irish", "Salsa"],
    },
]

# Old demo gallery URLs — not auto-seeded. Use POST /api/gallery/migrate-legacy to upload these into Cloudinary once.
LEGACY_GALLERY_MIGRATION_URLS = [
    f"{BASE_IMG}/2025/01/g-1-1.jpg",
    f"{BASE_IMG}/2025/01/g-2-1.jpg",
    f"{BASE_IMG}/2025/01/g-3-1.jpg",
    f"{BASE_IMG}/2025/01/g-4-1.jpg",
    f"{BASE_IMG}/2025/01/g-5-1.jpg",
    f"{BASE_IMG}/2025/01/g-6-1.jpg",
    f"{BASE_IMG}/2025/01/g-7-1.jpg",
    f"{BASE_IMG}/2025/01/g-8-1.jpg",
    f"{BASE_IMG}/2025/01/g-9-1.jpg",
]

DEFAULT_INSTRUCTORS = [
    {
        "id": "in-1",
        "image": f"{BASE_IMG}/2025/02/team-4-1.png",
        "name": "Leslie Alexander",
        "role": "Just Dance",
        "socials": {"facebook": "#", "twitter": "#", "linkedin": "#", "instagram": "#"},
    },
    {
        "id": "in-2",
        "image": f"{BASE_IMG}/2025/02/team-3-1.png",
        "name": "Gloria Jenkins",
        "role": "Break Dance",
        "socials": {"facebook": "#", "twitter": "#", "linkedin": "#", "instagram": "#"},
    },
    {
        "id": "in-3",
        "image": f"{BASE_IMG}/2025/02/team-2-1.png",
        "name": "Devin Bennett",
        "role": "Hip Hop",
        "socials": {"facebook": "#", "twitter": "#", "linkedin": "#", "instagram": "#"},
    },
    {
        "id": "in-4",
        "image": f"{BASE_IMG}/2025/02/team-1-1.png",
        "name": "Danna Martinez",
        "role": "Dance Fitness",
        "socials": {"facebook": "#", "twitter": "#", "linkedin": "#", "instagram": "#"},
    },
]

DEFAULT_BLOG = [
    {
        "id": "bl-1",
        "image": f"{BASE_IMG}/2025/02/tim-gouw-tYpp-eIZH44-unsplash-1-1.jpg",
        "title": "Fabulous Dancing And Choreography…",
        "description": "Experience show-stopping moves and stunning choreography designed to captivate every...",
        "date": "Feb 21, 2025",
        "category": "Uncategorized",
    },
    {
        "id": "bl-2",
        "image": f"{BASE_IMG}/2025/02/ilja-tulit-ucAMMD36Si0-unsplash-1-1.jpg",
        "title": "Move To The Beat…",
        "description": "Let the music take control. Whether you're just beginning or refining your skills, our studio helps you connect with every...",
        "date": "Feb 5, 2025",
        "category": "Salsa Dance",
    },
    {
        "id": "bl-3",
        "image": f"{BASE_IMG}/2025/02/ss-1.jpg",
        "title": "Dance Is For The Free Soul…",
        "description": "In our space, dance becomes a journey of freedom, expression, and discovery. No judgment. No...",
        "date": "Feb 5, 2025",
        "category": "Tap Dance",
    },
]

DEFAULT_TESTIMONIALS = [
    {
        "id": "tm-1",
        "text": "This studio changed the way I see dance. The instructors are so supportive, and every session is full of energy and passion. I have grown so much as a dancer here.",
        "image": f"{BASE_IMG}/2025/02/testi-1-1.png",
        "name": "Brooklyn Simmons",
        "role": "Junior Dancer",
    },
    {
        "id": "tm-2",
        "text": "From day one, I felt welcomed and inspired. The vibe here is amazing, and the choreography always pushes you to be your best. Truly a transformative experience.",
        "image": f"{BASE_IMG}/2025/02/Ellipse-55.png",
        "name": "Niklas Romain",
        "role": "Professional Instructor",
    },
    {
        "id": "tm-3",
        "text": "A perfect blend of discipline and creativity. I have learned so much, and the experience has truly helped me grow as both a dancer and a person.",
        "image": f"{BASE_IMG}/2025/02/Ellipse-56.png",
        "name": "Friendrich Gabriel",
        "role": "Dance Student",
    },
]

DEFAULT_SCHEDULE_ROWS = [
    {"time": "8:00 AM", "monday": "Ballet", "tuesday": "Hip Hop", "wednesday": "Jazz", "thursday": "Contemporary", "friday": "Salsa", "saturday": "Tap"},
    {"time": "9:30 AM", "monday": "Contemporary", "tuesday": "Ballet", "wednesday": "Belly", "thursday": "Hip Hop", "friday": "Jazz", "saturday": "Modern"},
    {"time": "11:00 AM", "monday": "Hip Hop", "tuesday": "Salsa", "wednesday": "Ballet", "thursday": "Kathak", "friday": "Contemporary", "saturday": "Ballet"},
    {"time": "1:00 PM", "monday": "Jazz", "tuesday": "Contemporary", "wednesday": "Hip Hop", "thursday": "Ballet", "friday": "Modern", "saturday": "Belly"},
    {"time": "3:00 PM", "monday": "Salsa", "tuesday": "Tap", "wednesday": "Contemporary", "thursday": "Jazz", "friday": "Ballet", "saturday": "Hip Hop"},
    {"time": "5:00 PM", "monday": "Tap", "tuesday": "Jazz", "wednesday": "Salsa", "thursday": "Modern", "friday": "Hip Hop", "saturday": "Contemporary"},
]


def init_site_content(database, mongo_ok: bool) -> None:
    global DB, MONGO_AVAILABLE
    DB = database
    MONGO_AVAILABLE = bool(mongo_ok)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_memory_seed() -> None:
    global _seeded_memory, _im_categories, _im_dance_items, _im_gallery, _im_instructors, _im_blog, _im_testimonials, _im_schedule_rows
    if _seeded_memory:
        return
    _im_categories = list(DEFAULT_CATEGORIES)
    ts = _now()
    _im_dance_items = {}
    for d in DEFAULT_DANCE_ITEMS:
        row = dict(d)
        row["created_at"] = ts
        row["updated_at"] = ts
        _im_dance_items[d["id"]] = row
    _im_gallery = {}
    _im_instructors = {}
    for x in DEFAULT_INSTRUCTORS:
        row = dict(x)
        row["created_at"] = ts
        row["updated_at"] = ts
        _im_instructors[x["id"]] = row
    _im_blog = {}
    for x in DEFAULT_BLOG:
        row = dict(x)
        row["created_at"] = ts
        row["updated_at"] = ts
        _im_blog[x["id"]] = row
    _im_testimonials = {}
    for x in DEFAULT_TESTIMONIALS:
        row = dict(x)
        row["created_at"] = ts
        row["updated_at"] = ts
        _im_testimonials[x["id"]] = row
    _im_schedule_rows = [dict(r) for r in DEFAULT_SCHEDULE_ROWS]
    _seeded_memory = True


async def seed_mongo_if_empty() -> None:
    if not MONGO_AVAILABLE or DB is None:
        return
    try:
        if await DB.dance_school_categories.count_documents({}) == 0:
            await DB.dance_school_categories.insert_one({"id": "default", "categories": DEFAULT_CATEGORIES})
        if await DB.dance_school_items.count_documents({}) == 0:
            await DB.dance_school_items.insert_many([{**d, "created_at": _now(), "updated_at": _now()} for d in DEFAULT_DANCE_ITEMS])
        if await DB.instructors.count_documents({}) == 0:
            await DB.instructors.insert_many([{**x, "created_at": _now(), "updated_at": _now()} for x in DEFAULT_INSTRUCTORS])
        if await DB.blog_posts.count_documents({}) == 0:
            await DB.blog_posts.insert_many([{**x, "created_at": _now(), "updated_at": _now()} for x in DEFAULT_BLOG])
        if await DB.testimonials.count_documents({}) == 0:
            await DB.testimonials.insert_many([{**x, "created_at": _now(), "updated_at": _now()} for x in DEFAULT_TESTIMONIALS])
        if await DB.class_schedule.count_documents({}) == 0:
            await DB.class_schedule.insert_one({"id": "default", "rows": DEFAULT_SCHEDULE_ROWS, "updated_at": _now()})
    except Exception:
        pass


# --- Pydantic ---


class CategoriesUpdate(BaseModel):
    categories: List[str] = Field(..., min_length=1)


class DanceSchoolItemCreate(BaseModel):
    title: str
    category: str = ""
    image: str = ""
    tags: List[str] = Field(default_factory=list)


class DanceSchoolItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[List[str]] = None


class GalleryCreate(BaseModel):
    """Must be a Cloudinary delivery URL (from POST /api/upload or import-remote)."""
    url: str = Field(..., min_length=10)
    sort_order: int = -1


class GalleryImportRemote(BaseModel):
    """Fetch any image URL and upload to Cloudinary folder `gallery`, then create a gallery row."""
    url: str = Field(..., min_length=8)


class GalleryMigrateLegacy(BaseModel):
    confirm: bool = False


class GalleryRepairCloudinary(BaseModel):
    """Re-create DB rows for images that exist in Cloudinary but not in gallery_items."""

    confirm: bool = False


class InstructorCreate(BaseModel):
    name: str
    role: str = ""
    image: str = ""
    socials: Dict[str, str] = Field(default_factory=dict)


class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    image: Optional[str] = None
    socials: Optional[Dict[str, str]] = None


class BlogCreate(BaseModel):
    title: str
    description: str = ""
    date: str = ""
    category: str = ""
    image: str = ""


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None


class TestimonialCreate(BaseModel):
    text: str
    name: str
    role: str = ""
    image: str = ""


class TestimonialUpdate(BaseModel):
    text: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    image: Optional[str] = None


class ClassScheduleUpdate(BaseModel):
    rows: List[Dict[str, Any]] = Field(..., min_length=1)


def _cloudinary_configured() -> bool:
    cfg = cloudinary.config()
    return bool(cfg.cloud_name and cfg.api_key and cfg.api_secret)


def _is_cloudinary_delivery_url(url: str) -> bool:
    u = (url or "").strip().lower()
    return "res.cloudinary.com/" in u


def _normalize_cloudinary_url_for_compare(url: str) -> str:
    return (url or "").strip().split("?")[0].rstrip("/").lower()


def _extract_cloudinary_public_id(url: str) -> Optional[str]:
    if "res.cloudinary.com" not in url:
        return None
    match = re.search(r"/upload/(?:v\d+/)?(.+)$", url)
    if not match:
        return None
    public_with_ext = match.group(1).split("?")[0]
    return re.sub(r"\.[^./]+$", "", public_with_ext)


async def _delete_cloudinary_asset_by_url(url: str) -> None:
    pid = _extract_cloudinary_public_id(url)
    if not pid:
        return
    await asyncio.to_thread(cloudinary.uploader.destroy, pid, resource_type="image", invalidate=True)
    await asyncio.to_thread(cloudinary.uploader.destroy, pid, resource_type="video", invalidate=True)


async def _list_cloudinary_image_resources_by_prefix(prefix: str) -> List[dict]:
    """Paginate Cloudinary Admin API (images only)."""
    out: List[dict] = []
    next_cursor: Optional[str] = None
    while True:
        kwargs: Dict[str, Any] = {
            "resource_type": "image",
            "type": "upload",
            "prefix": prefix,
            "max_results": 500,
        }
        if next_cursor:
            kwargs["next_cursor"] = next_cursor

        def _call() -> dict:
            return cloudinary.api.resources(**kwargs)

        batch = await asyncio.to_thread(_call)
        out.extend(batch.get("resources", []))
        next_cursor = batch.get("next_cursor")
        if not next_cursor:
            break
    return out


# --- Read helpers ---


async def _get_categories_list() -> List[str]:
    if MONGO_AVAILABLE and DB is not None:
        doc = await DB.dance_school_categories.find_one({"id": "default"}, {"_id": 0})
        if doc and doc.get("categories"):
            return list(doc["categories"])
    _ensure_memory_seed()
    return list(_im_categories)


async def _get_dance_items_list() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        items = await DB.dance_school_items.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
        return items
    _ensure_memory_seed()
    return sorted(_im_dance_items.values(), key=lambda x: x.get("created_at", ""), reverse=True)


async def _get_gallery_list() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        items = await DB.gallery_items.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)
        return items
    _ensure_memory_seed()
    return sorted(_im_gallery.values(), key=lambda x: x.get("sort_order", 0))


async def _next_gallery_sort_order() -> int:
    items = await _get_gallery_list()
    if not items:
        return 0
    return max(x.get("sort_order", 0) for x in items) + 1


async def _get_gallery_doc_by_id(item_id: str) -> Optional[dict]:
    if MONGO_AVAILABLE and DB is not None:
        return await DB.gallery_items.find_one({"id": item_id}, {"_id": 0})
    _ensure_memory_seed()
    return _im_gallery.get(item_id)


async def _get_instructors_list() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        return await DB.instructors.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    _ensure_memory_seed()
    return list(_im_instructors.values())


async def _get_blog_list() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        return await DB.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    _ensure_memory_seed()
    return sorted(_im_blog.values(), key=lambda x: x.get("created_at", ""), reverse=True)


async def _get_testimonials_list() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        return await DB.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    _ensure_memory_seed()
    return list(_im_testimonials.values())


async def _get_schedule_rows() -> List[dict]:
    if MONGO_AVAILABLE and DB is not None:
        doc = await DB.class_schedule.find_one({"id": "default"}, {"_id": 0})
        if doc and doc.get("rows"):
            return list(doc["rows"])
    _ensure_memory_seed()
    return list(_im_schedule_rows)


def register_site_content_routes(api_router: APIRouter, verify_token_dep: Callable) -> None:
    @api_router.get("/site-content")
    async def get_site_content_bundle():
        """Single payload for homepage — one HTTP round trip."""
        cats = await _get_categories_list()
        dance = await _get_dance_items_list()
        gallery = await _get_gallery_list()
        instructors = await _get_instructors_list()
        blog = await _get_blog_list()
        testimonials = await _get_testimonials_list()
        schedule = await _get_schedule_rows()
        gallery_urls = [g.get("url", "") for g in gallery if g.get("url")]
        return {
            "danceSchoolCategories": cats,
            "danceSchoolItems": dance,
            "gallery": gallery,
            "galleryImages": gallery_urls,
            "instructors": instructors,
            "classSchedule": schedule,
            "blogPosts": blog,
            "testimonials": testimonials,
        }

    @api_router.get("/dance-school/categories", response_model=List[str])
    async def get_dance_categories():
        return await _get_categories_list()

    @api_router.put("/dance-school/categories")
    async def put_dance_categories(body: CategoriesUpdate, username: str = Depends(verify_token_dep)):
        if MONGO_AVAILABLE and DB is not None:
            await DB.dance_school_categories.update_one(
                {"id": "default"},
                {"$set": {"categories": body.categories, "updated_at": _now()}},
                upsert=True,
            )
        else:
            _ensure_memory_seed()
            global _im_categories
            _im_categories = list(body.categories)
        return await _get_categories_list()

    @api_router.get("/dance-school/items", response_model=List[dict])
    async def list_dance_items():
        return await _get_dance_items_list()

    @api_router.post("/dance-school/items", response_model=dict)
    async def create_dance_item(body: DanceSchoolItemCreate, username: str = Depends(verify_token_dep)):
        new_id = str(uuid.uuid4())
        doc = {
            "id": new_id,
            "title": body.title,
            "category": body.category,
            "image": body.image,
            "tags": body.tags,
            "created_at": _now(),
            "updated_at": _now(),
        }
        if MONGO_AVAILABLE and DB is not None:
            await DB.dance_school_items.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_dance_items[new_id] = doc
        return doc

    @api_router.put("/dance-school/items/{item_id}", response_model=dict)
    async def update_dance_item(item_id: str, body: DanceSchoolItemUpdate, username: str = Depends(verify_token_dep)):
        patch = {k: v for k, v in body.model_dump().items() if v is not None}
        patch["updated_at"] = _now()
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.dance_school_items.update_one({"id": item_id}, {"$set": patch})
            if r.matched_count == 0:
                raise HTTPException(status_code=404, detail="Item not found")
            return await DB.dance_school_items.find_one({"id": item_id}, {"_id": 0})
        _ensure_memory_seed()
        if item_id not in _im_dance_items:
            raise HTTPException(status_code=404, detail="Item not found")
        _im_dance_items[item_id].update(patch)
        return _im_dance_items[item_id]

    @api_router.delete("/dance-school/items/{item_id}")
    async def delete_dance_item(item_id: str, username: str = Depends(verify_token_dep)):
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.dance_school_items.delete_one({"id": item_id})
            if r.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Item not found")
        else:
            _ensure_memory_seed()
            if item_id not in _im_dance_items:
                raise HTTPException(status_code=404, detail="Item not found")
            del _im_dance_items[item_id]
        return {"success": True}

    @api_router.get("/gallery", response_model=List[dict])
    async def list_gallery():
        return await _get_gallery_list()

    @api_router.post("/gallery", response_model=dict)
    async def create_gallery(body: GalleryCreate, username: str = Depends(verify_token_dep)):
        url = body.url.strip()
        if not _is_cloudinary_delivery_url(url):
            raise HTTPException(
                status_code=400,
                detail="Gallery only accepts Cloudinary image URLs. Upload from the admin screen or use Import URL.",
            )
        sort_order = body.sort_order if body.sort_order >= 0 else await _next_gallery_sort_order()
        new_id = str(uuid.uuid4())
        doc = {"id": new_id, "url": url, "sort_order": sort_order, "created_at": _now()}
        if MONGO_AVAILABLE and DB is not None:
            await DB.gallery_items.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_gallery[new_id] = doc
        return doc

    @api_router.post("/gallery/import-remote", response_model=dict)
    async def import_gallery_remote(body: GalleryImportRemote, username: str = Depends(verify_token_dep)):
        if not _cloudinary_configured():
            raise HTTPException(status_code=500, detail="Cloudinary is not configured on server")
        raw = body.url.strip()
        if _is_cloudinary_delivery_url(raw):
            sort_order = await _next_gallery_sort_order()
            new_id = str(uuid.uuid4())
            doc = {"id": new_id, "url": raw, "sort_order": sort_order, "created_at": _now(), "source": "cloudinary_existing"}
            if MONGO_AVAILABLE and DB is not None:
                await DB.gallery_items.insert_one(doc)
            else:
                _ensure_memory_seed()
                _im_gallery[new_id] = doc
            return doc
        try:
            result = await asyncio.to_thread(
                cloudinary.uploader.upload,
                raw,
                folder="gallery",
                resource_type="image",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not import image to Cloudinary: {str(e)}")
        secure_url = result.get("secure_url")
        if not secure_url:
            raise HTTPException(status_code=500, detail="Cloudinary did not return a URL")
        sort_order = await _next_gallery_sort_order()
        new_id = str(uuid.uuid4())
        doc = {"id": new_id, "url": secure_url, "sort_order": sort_order, "created_at": _now(), "source": "import_remote"}
        if MONGO_AVAILABLE and DB is not None:
            await DB.gallery_items.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_gallery[new_id] = doc
        return doc

    @api_router.post("/gallery/migrate-legacy")
    async def migrate_legacy_gallery(body: GalleryMigrateLegacy, username: str = Depends(verify_token_dep)):
        """One-time: upload former demo gallery URLs into Cloudinary and save rows."""
        if not body.confirm:
            raise HTTPException(status_code=400, detail="Set confirm: true to run migration")
        if not _cloudinary_configured():
            raise HTTPException(status_code=500, detail="Cloudinary is not configured on server")
        created = []
        errors = []
        for raw in LEGACY_GALLERY_MIGRATION_URLS:
            try:
                result = await asyncio.to_thread(
                    cloudinary.uploader.upload,
                    raw,
                    folder="gallery",
                    resource_type="image",
                )
                secure_url = result.get("secure_url")
                if not secure_url:
                    errors.append({"url": raw, "error": "no secure_url"})
                    continue
                sort_order = await _next_gallery_sort_order()
                new_id = str(uuid.uuid4())
                doc = {
                    "id": new_id,
                    "url": secure_url,
                    "sort_order": sort_order,
                    "created_at": _now(),
                    "source": "migrate_legacy",
                }
                if MONGO_AVAILABLE and DB is not None:
                    await DB.gallery_items.insert_one(doc)
                else:
                    _ensure_memory_seed()
                    _im_gallery[new_id] = doc
                created.append(doc)
            except Exception as e:
                errors.append({"url": raw, "error": str(e)})
        return {"created": len(created), "items": created, "errors": errors}

    @api_router.post("/gallery/repair-cloudinary")
    async def repair_gallery_from_cloudinary(
        body: GalleryRepairCloudinary, username: str = Depends(verify_token_dep)
    ):
        """
        Re-add gallery DB rows for images that exist in Cloudinary (folders `events` and `gallery`)
        but are missing from `gallery_items`. Does not delete anything.
        """
        if not body.confirm:
            raise HTTPException(status_code=400, detail="Set confirm: true to run repair")
        if not _cloudinary_configured():
            raise HTTPException(status_code=500, detail="Cloudinary is not configured")
        if not MONGO_AVAILABLE or DB is None:
            raise HTTPException(
                status_code=503,
                detail="MongoDB is required. The server is in in-memory mode or the database is unavailable — "
                "gallery rows are not persisted, but uploads still appear in Cloudinary.",
            )

        existing = await _get_gallery_list()
        seen_pids: Set[str] = set()
        seen_urls: Set[str] = set()
        for g in existing:
            u = g.get("url") or ""
            seen_urls.add(_normalize_cloudinary_url_for_compare(u))
            pid = _extract_cloudinary_public_id(u)
            if pid:
                seen_pids.add(pid)

        merged: List[dict] = []
        for prefix in ("events", "gallery"):
            try:
                merged.extend(await _list_cloudinary_image_resources_by_prefix(prefix))
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Cloudinary list failed ({prefix}): {str(e)}")

        created: List[dict] = []
        for r in merged:
            secure_url = r.get("secure_url")
            public_id = r.get("public_id")
            if not secure_url or not public_id:
                continue
            if public_id in seen_pids:
                continue
            nu = _normalize_cloudinary_url_for_compare(secure_url)
            if nu in seen_urls:
                continue

            sort_order = await _next_gallery_sort_order()
            new_id = str(uuid.uuid4())
            doc = {
                "id": new_id,
                "url": secure_url,
                "sort_order": sort_order,
                "created_at": _now(),
                "source": "repair_cloudinary",
            }
            await DB.gallery_items.insert_one(doc)
            created.append(doc)
            seen_pids.add(public_id)
            seen_urls.add(nu)

        return {"added": len(created), "items": created}

    @api_router.delete("/gallery/{item_id}")
    async def delete_gallery(item_id: str, username: str = Depends(verify_token_dep)):
        doc = await _get_gallery_doc_by_id(item_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Not found")
        url = doc.get("url") or ""
        if url and _is_cloudinary_delivery_url(url):
            try:
                await _delete_cloudinary_asset_by_url(url)
            except Exception:
                pass
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.gallery_items.delete_one({"id": item_id})
            if r.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
        else:
            _ensure_memory_seed()
            if item_id not in _im_gallery:
                raise HTTPException(status_code=404, detail="Not found")
            del _im_gallery[item_id]
        return {"success": True}

    @api_router.get("/instructors", response_model=List[dict])
    async def list_instructors():
        return await _get_instructors_list()

    @api_router.post("/instructors", response_model=dict)
    async def create_instructor(body: InstructorCreate, username: str = Depends(verify_token_dep)):
        new_id = str(uuid.uuid4())
        doc = {
            "id": new_id,
            "name": body.name,
            "role": body.role,
            "image": body.image,
            "socials": body.socials or {},
            "created_at": _now(),
            "updated_at": _now(),
        }
        if MONGO_AVAILABLE and DB is not None:
            await DB.instructors.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_instructors[new_id] = doc
        return doc

    @api_router.put("/instructors/{inst_id}", response_model=dict)
    async def update_instructor(inst_id: str, body: InstructorUpdate, username: str = Depends(verify_token_dep)):
        patch = {k: v for k, v in body.model_dump().items() if v is not None}
        patch["updated_at"] = _now()
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.instructors.update_one({"id": inst_id}, {"$set": patch})
            if r.matched_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
            return await DB.instructors.find_one({"id": inst_id}, {"_id": 0})
        _ensure_memory_seed()
        if inst_id not in _im_instructors:
            raise HTTPException(status_code=404, detail="Not found")
        _im_instructors[inst_id].update(patch)
        return _im_instructors[inst_id]

    @api_router.delete("/instructors/{inst_id}")
    async def delete_instructor(inst_id: str, username: str = Depends(verify_token_dep)):
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.instructors.delete_one({"id": inst_id})
            if r.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
        else:
            _ensure_memory_seed()
            if inst_id not in _im_instructors:
                raise HTTPException(status_code=404, detail="Not found")
            del _im_instructors[inst_id]
        return {"success": True}

    @api_router.get("/class-schedule", response_model=List[dict])
    async def get_class_schedule():
        return await _get_schedule_rows()

    @api_router.put("/class-schedule", response_model=List[dict])
    async def put_class_schedule(body: ClassScheduleUpdate, username: str = Depends(verify_token_dep)):
        for row in body.rows:
            if "time" not in row:
                raise HTTPException(status_code=400, detail="Each row must include 'time'")
        if MONGO_AVAILABLE and DB is not None:
            await DB.class_schedule.update_one(
                {"id": "default"},
                {"$set": {"rows": body.rows, "updated_at": _now()}},
                upsert=True,
            )
        else:
            _ensure_memory_seed()
            global _im_schedule_rows
            _im_schedule_rows = [dict(r) for r in body.rows]
        return await _get_schedule_rows()

    @api_router.get("/blog-posts", response_model=List[dict])
    async def list_blog():
        return await _get_blog_list()

    @api_router.post("/blog-posts", response_model=dict)
    async def create_blog(body: BlogCreate, username: str = Depends(verify_token_dep)):
        new_id = str(uuid.uuid4())
        doc = {
            "id": new_id,
            "title": body.title,
            "description": body.description,
            "date": body.date,
            "category": body.category,
            "image": body.image,
            "created_at": _now(),
            "updated_at": _now(),
        }
        if MONGO_AVAILABLE and DB is not None:
            await DB.blog_posts.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_blog[new_id] = doc
        return doc

    @api_router.put("/blog-posts/{post_id}", response_model=dict)
    async def update_blog(post_id: str, body: BlogUpdate, username: str = Depends(verify_token_dep)):
        patch = {k: v for k, v in body.model_dump().items() if v is not None}
        patch["updated_at"] = _now()
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.blog_posts.update_one({"id": post_id}, {"$set": patch})
            if r.matched_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
            return await DB.blog_posts.find_one({"id": post_id}, {"_id": 0})
        _ensure_memory_seed()
        if post_id not in _im_blog:
            raise HTTPException(status_code=404, detail="Not found")
        _im_blog[post_id].update(patch)
        return _im_blog[post_id]

    @api_router.delete("/blog-posts/{post_id}")
    async def delete_blog(post_id: str, username: str = Depends(verify_token_dep)):
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.blog_posts.delete_one({"id": post_id})
            if r.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
        else:
            _ensure_memory_seed()
            if post_id not in _im_blog:
                raise HTTPException(status_code=404, detail="Not found")
            del _im_blog[post_id]
        return {"success": True}

    @api_router.get("/testimonials", response_model=List[dict])
    async def list_testimonials_public():
        return await _get_testimonials_list()

    @api_router.post("/testimonials", response_model=dict)
    async def create_testimonial(body: TestimonialCreate, username: str = Depends(verify_token_dep)):
        new_id = str(uuid.uuid4())
        doc = {
            "id": new_id,
            "text": body.text,
            "name": body.name,
            "role": body.role,
            "image": body.image,
            "created_at": _now(),
            "updated_at": _now(),
        }
        if MONGO_AVAILABLE and DB is not None:
            await DB.testimonials.insert_one(doc)
        else:
            _ensure_memory_seed()
            _im_testimonials[new_id] = doc
        return doc

    @api_router.put("/testimonials/{tid}", response_model=dict)
    async def update_testimonial(tid: str, body: TestimonialUpdate, username: str = Depends(verify_token_dep)):
        patch = {k: v for k, v in body.model_dump().items() if v is not None}
        patch["updated_at"] = _now()
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.testimonials.update_one({"id": tid}, {"$set": patch})
            if r.matched_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
            return await DB.testimonials.find_one({"id": tid}, {"_id": 0})
        _ensure_memory_seed()
        if tid not in _im_testimonials:
            raise HTTPException(status_code=404, detail="Not found")
        _im_testimonials[tid].update(patch)
        return _im_testimonials[tid]

    @api_router.delete("/testimonials/{tid}")
    async def delete_testimonial(tid: str, username: str = Depends(verify_token_dep)):
        if MONGO_AVAILABLE and DB is not None:
            r = await DB.testimonials.delete_one({"id": tid})
            if r.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Not found")
        else:
            _ensure_memory_seed()
            if tid not in _im_testimonials:
                raise HTTPException(status_code=404, detail="Not found")
            del _im_testimonials[tid]
        return {"success": True}
