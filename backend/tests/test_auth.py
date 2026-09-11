def test_register_returns_token(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "new@example.com", "name": "New User", "password": "supersecret1"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"


def test_register_duplicate_email_conflicts(client):
    payload = {"email": "dupe@example.com", "name": "Dupe", "password": "supersecret1"}
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_login_with_correct_credentials(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "name": "Login", "password": "supersecret1"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "supersecret1"},
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_login_with_invalid_credentials_returns_401(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpass@example.com", "name": "X", "password": "supersecret1"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_unknown_email_returns_401(client):
    response = client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever1"}
    )
    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_profile_with_valid_token(client, auth_headers):
    headers = auth_headers(email="profile@example.com")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "profile@example.com"
    assert body["name"] == "Test User"


def test_me_rejects_garbage_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401
