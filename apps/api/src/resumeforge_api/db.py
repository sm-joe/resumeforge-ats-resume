import os
from pathlib import Path

from sqlalchemy import JSON, DateTime, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


DATA_DIR = Path(
    os.getenv(
        "RESUMEFORGE_DATA_DIR",
        Path(__file__).resolve().parents[3] / "data",
    ),
)

DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'resumeforge.db'}"


class Base(DeclarativeBase):
    pass


class ResumeRecord(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    schema_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    resume_json: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        nullable=False,
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime,
        nullable=False,
    )


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)