import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(mobile, password="Password123!"):
    res = client.post("/api/auth/login", json={"mobile_or_email": mobile, "password": password})
    return res.json()["access_token"]

def test_disease_requests_and_quotations_flow():
    farmer_token = get_auth_token("9876543210")
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Farmer checks their disease requests
    res = client.get("/api/disease-requests/my", headers=headers)
    assert res.status_code == 200
    requests = res.json()
    assert len(requests) >= 1
    req = requests[0]
    assert "Tomato" in req["crop_name"]
    assert req["ai_report"] is not None
    assert req["ai_report"]["is_simulated"] is True

    # 2. Compare dealer quotations
    res = client.get(f"/api/disease-requests/{req['id']}/quotations", headers=headers)
    assert res.status_code == 200
    quotes = res.json()
    assert len(quotes) >= 3  # Dealer A, B, C

    amounts = [float(q["total_amount"]) for q in quotes]
    # Check that ₹700, ₹680, ₹730 demonstration totals exist
    assert 700.00 in amounts
    assert 680.00 in amounts
    assert 730.00 in amounts

def test_order_and_payment_flow():
    farmer_token = get_auth_token("9876543210")
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # Find quotation for ₹700 (Dealer A)
    res = client.get("/api/disease-requests/my", headers=headers)
    req = res.json()[0]
    res_quotes = client.get(f"/api/disease-requests/{req['id']}/quotations", headers=headers)
    quotes = res_quotes.json()
    selected_quote = [q for q in quotes if float(q["total_amount"]) == 700.00][0]

    # Create order
    order_payload = {
        "quotation_id": selected_quote["id"],
        "delivery_address": "Plot 14, Mariamman Koil Street, Natrampalli Pudur, Natrampalli - 635852",
        "contact_mobile": "9876543210",
        "delivery_notes": "Please deliver near village primary school"
    }
    res_order = client.post("/api/orders", json=order_payload, headers=headers)
    assert res_order.status_code == 200
    order_data = res_order.json()
    assert order_data["status"] == "payment_pending"
    assert float(order_data["total_amount"]) == 700.00

    # Server-side verify payment
    pay_payload = {
        "order_id": order_data["id"],
        "payment_method": "UPI (Demo Sandbox)"
    }
    res_pay = client.post("/api/payments/verify", json=pay_payload, headers=headers)
    assert res_pay.status_code == 200
    pay_data = res_pay.json()
    assert pay_data["success"] is True
    assert pay_data["status"] == "payment_confirmed"

    # Duplicate payment attempt should fail
    res_dup = client.post("/api/payments/verify", json=pay_payload, headers=headers)
    assert res_dup.status_code == 400

    # Dealer A updates order progress
    dealer_token = get_auth_token("9876543211")
    dealer_headers = {"Authorization": f"Bearer {dealer_token}"}
    
    update_res = client.patch(
        f"/api/dealer/orders/{order_data['id']}/status",
        json={"status": "out_for_delivery", "delivery_notes": "Driver Murugan on way to Natrampalli Pudur"},
        headers=dealer_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["new_status"] == "out_for_delivery"
