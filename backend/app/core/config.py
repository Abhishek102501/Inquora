"""Centralized application configuration.

All tunables that would otherwise be hardcoded (model names, chunk sizes,
retrieval thresholds, embedding dimensions) live here and are sourced from
environment variables. Nothing in this file should ever contain a real
secret — see backend/.env.example for the variables this reads.
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # MongoDB
    mongodb_uri: str = Field(default="", alias="MONGODB_URI")
    mongodb_database: str = Field(default="inqora", alias="MONGODB_DATABASE")
    mongodb_vector_index: str = Field(default="chunks_vector_index", alias="MONGODB_VECTOR_INDEX")

    # Auth
    jwt_secret_key: str = Field(default="", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=60, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")

    # Gemini
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.0-flash", alias="GEMINI_MODEL")
    gemini_embedding_model: str = Field(default="text-embedding-004", alias="GEMINI_EMBEDDING_MODEL")
    # MUST match the real output dimensionality of gemini_embedding_model.
    # Centralized here rather than guessed inline anywhere in the codebase.
    gemini_embedding_dimensions: int = Field(default=768, alias="GEMINI_EMBEDDING_DIMENSIONS")

    # Storage
    storage_provider: str = Field(default="local", alias="STORAGE_PROVIDER")
    storage_bucket: str = Field(default="", alias="STORAGE_BUCKET")
    storage_region: str = Field(default="", alias="STORAGE_REGION")
    storage_access_key: str = Field(default="", alias="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field(default="", alias="STORAGE_SECRET_KEY")
    local_storage_dir: str = Field(default="uploads", alias="LOCAL_STORAGE_DIR")

    max_upload_size_mb: int = Field(default=25, alias="MAX_UPLOAD_SIZE_MB")

    # CORS
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    # RAG tuning
    chunk_size: int = Field(default=1000, alias="CHUNK_SIZE")
    chunk_overlap: int = Field(default=150, alias="CHUNK_OVERLAP")
    retrieval_top_k: int = Field(default=8, alias="RETRIEVAL_TOP_K")
    retrieval_max_context_chunks: int = Field(default=6, alias="RETRIEVAL_MAX_CONTEXT_CHUNKS")
    retrieval_similarity_threshold: float = Field(default=0.6, alias="RETRIEVAL_SIMILARITY_THRESHOLD")
    conversation_history_messages: int = Field(default=8, alias="CONVERSATION_HISTORY_MESSAGES")

    @field_validator("chunk_overlap")
    @classmethod
    def overlap_smaller_than_chunk(cls, v: int, info) -> int:
        chunk_size = info.data.get("chunk_size", 1000)
        if v >= chunk_size:
            raise ValueError("CHUNK_OVERLAP must be smaller than CHUNK_SIZE")
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
