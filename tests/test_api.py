from urllib.parse import quote


def test_get_activities(client):
    # Arrange: none (server has initial activities)
    # Act
    r = client.get("/activities")
    # Assert
    assert r.status_code == 200
    data = r.json()
    assert "Chess Club" in data


def test_signup_adds_participant(client):
    # Arrange
    email = "teststudent@mergington.edu"
    activity = "Chess Club"

    # Act
    r = client.post(f"/activities/{quote(activity)}/signup", params={"email": email})

    # Assert
    assert r.status_code == 200
    participants = client.get("/activities").json()[activity]["participants"]
    assert email in participants


def test_signup_existing_returns_400(client):
    # Arrange
    existing = "michael@mergington.edu"  # already present in initial data
    activity = "Chess Club"

    # Act
    r = client.post(f"/activities/{quote(activity)}/signup", params={"email": existing})

    # Assert
    assert r.status_code == 400


def test_remove_participant(client):
    # Arrange: sign up a participant first
    email = "toremove@mergington.edu"
    activity = "Programming Class"
    r = client.post(f"/activities/{quote(activity)}/signup", params={"email": email})
    assert r.status_code == 200

    # Act: remove the participant
    r2 = client.delete(f"/activities/{quote(activity)}/participants", params={"email": email})

    # Assert
    assert r2.status_code == 200
    participants = client.get("/activities").json()[activity]["participants"]
    assert email not in participants


def test_remove_nonexistent_returns_404(client):
    # Arrange
    activity = "Gym Class"

    # Act
    r = client.delete(f"/activities/{quote(activity)}/participants", params={"email": "noone@x.com"})

    # Assert
    assert r.status_code == 404
