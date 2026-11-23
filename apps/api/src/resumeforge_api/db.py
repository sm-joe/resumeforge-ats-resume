import os
from pathlib import Path

from sqlalchemy import JSON, DateTime, String, create_engine, text
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
    owner_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
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
    # Upgrade existing SQLite databases without discarding legacy data.
    # Ownerless records cannot be accessed via the public resume endpoints.
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(resumes)"))
        }
        if columns and "owner_key_hash" not in columns:
            connection.execute(
                text("ALTER TABLE resumes ADD COLUMN owner_key_hash VARCHAR(64)")
            )
    Base.metadata.create_all(bind=engine)