import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(mobile, password="Password123!"):
    res = client.post("/api/auth/login", json={"mobile_or_email": mobile, "password": password})
    return res.json()["access_token"]

def test_crop_marketplace():
    buyer_token = get_auth_token("9876543214")
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # Browse crops
    res = client.get("/api/crop-listings")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 1

    # Advisory endpoints
    res_market = client.get("/api/advisory/market-prices")
    assert res_market.status_code == 200
    assert "Natrampalli" in res_market.json()["block"]

    res_weather = client.get("/api/advisory/weather")
    assert res_weather.status_code == 200
    assert "spray_advisory" in res_weather.json()

    res_schemes = client.get("/api/advisory/government-schemes")
    assert res_schemes.status_code == 200
    assert len(res_schemes.json()) >= 4

def test_machinery_rental():
    farmer_token = get_auth_token("9876543210")
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Browse machinery
    res = client.get("/api/machinery")
    assert res.status_code == 200
    machines = res.json()
    assert len(machines) >= 2
    tractor = [m for m in machines if m["equipment_type"] == "Tractor"][0]

    # Book machinery
    booking_payload = {
        "start_date": "2026-10-25",
        "end_date": "2026-10-25",
        "duration_units": 3,
        "rate_type": "hourly",
        "farm_location": "Survey No 142, Natrampalli Pudur Field"
    }
    book_res = client.post(f"/api/machinery/{tractor['id']}/bookings", json=booking_payload, headers=farmer_headers)
    assert book_res.status_code == 200
    booking = book_res.json()
    assert booking["status"] == "pending"
    assert booking["duration_units"] == 3
