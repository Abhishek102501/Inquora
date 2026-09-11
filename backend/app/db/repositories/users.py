from pymongo.database import Database

from app.db.repositories.base import stringify_id, to_object_id
from app.models.base import utcnow
from app.models.user import User


class UsersRepository:
    def __init__(self, db: Database):
        self._collection = db.users

    def create(self, email: str, name: str, password_hash: str) -> User:
        now = utcnow()
        doc = {
            "email": email.lower().strip(),
            "name": name,
            "passwordHash": password_hash,
            "createdAt": now,
            "updatedAt": now,
        }
        result = self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _to_model(doc)

    def get_by_email(self, email: str) -> User | None:
        doc = self._collection.find_one({"email": email.lower().strip()})
        return _to_model(doc) if doc else None

    def get_by_id(self, user_id: str) -> User | None:
        oid = to_object_id(user_id)
        if oid is None:
            return None
        doc = self._collection.find_one({"_id": oid})
        return _to_model(doc) if doc else None


def _to_model(doc: dict) -> User:
    data = stringify_id(doc)
    return User(
        id=data["id"],
        email=data["email"],
        name=data["name"],
        password_hash=data["passwordHash"],
        created_at=data["createdAt"],
        updated_at=data["updatedAt"],
    )
