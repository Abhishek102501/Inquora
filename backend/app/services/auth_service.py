from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.db.repositories.users import UsersRepository
from app.models.user import User


class AuthService:
    def __init__(self, users_repo: UsersRepository):
        self._users_repo = users_repo

    def register(self, email: str, name: str, password: str) -> tuple[User, str]:
        if self._users_repo.get_by_email(email):
            raise ConflictError("An account with this email already exists.")
        user = self._users_repo.create(email=email, name=name, password_hash=hash_password(password))
        token = create_access_token(subject=user.id)
        return user, token

    def login(self, email: str, password: str) -> tuple[User, str]:
        user = self._users_repo.get_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid email or password.")
        token = create_access_token(subject=user.id)
        return user, token
