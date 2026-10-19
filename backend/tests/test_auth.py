import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "UzhavarNanban 🌱"
    assert "Natrampalli" in data["location"]

def test_demo_accounts_available():
    res = client.get("/api/auth/demo-accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 4
    roles = [acc["role"] for acc in accounts]
    assert "farmer" in roles
    assert "dealer" in roles
    assert "buyer" in roles
    assert "machinery_owner" in roles

def test_farmer_login():
    res = client.post("/api/auth/login", json={
        "mobile_or_email": "9876543210",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "farmer"
    assert data["user"]["name"] == "Ramasamy Gounder (ராமசாமி)"

def test_dealer_login():
    res = client.post("/api/auth/login", json={
        "mobile_or_email": "9876543211",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "dealer"
    assert "Sri Murugan Agro Agencies" in data["user"]["profile"]["shop_name"]
