import certifi
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
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ==================== Models ====================
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "default"
    daily_goal: str = ""
    weekly_goal: str = ""
    monthly_goal: str = ""


class SettingsUpdate(BaseModel):
    daily_goal: Optional[str] = None
    weekly_goal: Optional[str] = None
    monthly_goal: Optional[str] = None


class LogEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str          # YYYY-MM-DD
    task: str
    start_time: str    # HH:MM (24h)
    end_time: str      # HH:MM (24h)
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LogEntryCreate(BaseModel):
    date: str
    task: str
    start_time: str
    end_time: str
    category: Optional[str] = None


class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: int
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SessionCreate(BaseModel):
    topic: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: int


# ==================== Helpers ====================
def _s(doc: dict, fields: list) -> dict:
    for f in fields:
        if doc.get(f) and isinstance(doc[f], str):
            doc[f] = datetime.fromisoformat(doc[f])
    return doc


def _to_mongo(model: BaseModel, dt_fields: list) -> dict:
    doc = model.model_dump()
    for f in dt_fields:
        if doc.get(f) is not None:
            doc[f] = doc[f].isoformat()
    return doc


def _minutes_between(start_hm: str, end_hm: str) -> int:
    try:
        sh, sm = [int(x) for x in start_hm.split(":")]
        eh, em = [int(x) for x in end_hm.split(":")]
        mins = (eh * 60 + em) - (sh * 60 + sm)
        # allow crossing midnight
        if mins < 0:
            mins += 24 * 60
        return max(0, mins)
    except Exception:
        return 0


def _now():
    return datetime.now(timezone.utc)


# ==================== Settings ====================
@api_router.get("/")
async def root():
    return {"message": "Focusroom API"}


@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if not doc:
        settings = Settings()
        await db.settings.insert_one(settings.model_dump())
        return settings
    return Settings(**doc)


@api_router.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate):
    existing = await db.settings.find_one({"id": "default"}, {"_id": 0}) or {}
    merged = Settings(**{**existing, **payload.model_dump(exclude_unset=True)})
    await db.settings.update_one(
        {"id": "default"},
        {"$set": merged.model_dump()},
        upsert=True,
    )
    return merged


# ==================== Log Entries ====================
@api_router.get("/log", response_model=List[LogEntry])
async def list_log(date: str):
    docs = await db.log_entries.find({"date": date}, {"_id": 0}).sort("start_time", 1).to_list(500)
    return [LogEntry(**_s(d, ["created_at"])) for d in docs]


@api_router.post("/log", response_model=LogEntry)
async def create_log(payload: LogEntryCreate):
    entry = LogEntry(**payload.model_dump())
    await db.log_entries.insert_one(_to_mongo(entry, ["created_at"]))
    return entry


@api_router.delete("/log/{entry_id}")
async def delete_log(entry_id: str):
    res = await db.log_entries.delete_one({"id": entry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"ok": True}


@api_router.get("/log/stats")
async def log_stats():
    now = _now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    docs = await db.sessions.find({}, {"_id": 0}).to_list(5000)
    today_min = week_min = month_min = 0
    for d in docs:
        ts = d.get("completed_at")
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        if ts is None:
            continue
        mins = int(d.get("duration_minutes", 0))
        if ts >= today_start:
            today_min += mins
        if ts >= week_start:
            week_min += mins
        if ts >= month_start:
            month_min += mins
    return {
        "today_minutes": today_min,
        "week_minutes": week_min,
        "month_minutes": month_min,
    }


@api_router.post("/sessions", response_model=Session)
async def create_session(payload: SessionCreate):
    session = Session(
        topic=payload.topic,
        category=payload.category,
        duration_minutes=payload.duration_minutes,
    )
    await db.sessions.insert_one(_to_mongo(session, ["completed_at"]))
    return session


# ==================== App wiring ====================
app.include_router(api_router)

local_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.174:3000",
]
# On Render, set CORS_ORIGINS to the public frontend URL. Multiple origins can
# be supplied as a comma-separated list, which keeps local development working
# without hard-coding a deployment URL in the source code.
configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=local_origins + configured_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
