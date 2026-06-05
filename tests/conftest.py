import copy
import pytest
from fastapi.testclient import TestClient

import src.app as app_module

# Snapshot the initial in-memory activities so tests are isolated
_initial_activities = copy.deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def reset_activities():
    # Arrange: reset global state before each test
    app_module.activities = copy.deepcopy(_initial_activities)
    yield
    # Teardown: restore snapshot (defensive)
    app_module.activities = copy.deepcopy(_initial_activities)


@pytest.fixture
def client():
    # Provide a TestClient for the FastAPI app
    with TestClient(app_module.app) as c:
        yield c
