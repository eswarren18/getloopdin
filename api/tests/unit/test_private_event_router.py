"""
Tests for event_router:
- Test event creation, update, deletion, and retrieval endpoints.
- Test permissions and event participation logic.
- Test error handling for invalid event operations.
"""

from fastapi.testclient import TestClient
from src.main.database import get_db
from src.main.main import app
from src.main.models import Event, Participant
from src.main.utils import get_current_user_from_token

client = TestClient(app)


 # --- Mocks ---
class MockEvent:
    def __init__(
        self,
        address="123 Main",
        description="Mock event for testing",
        end_time="2025-11-26T22:17:41.110000Z",
        id=1,
        start_time="2025-11-25T22:17:41.110000Z",
        title="Mock Event",
    ):
        self.address = address
        self.description = description
        self.end_time = end_time
        self.id = id
        self.start_time = start_time
        self.title = title


class MockEventQuery:
    def __init__(self, events):
        self._events = events

    def filter(self, *args):
        filtered = self._events
        for arg in args:
            if callable(arg):
                filtered = [e for e in filtered if arg(e)]
            else:
                # Handle `Event.id.in_([...])`
                if hasattr(arg, 'left') and getattr(arg.left, 'name', None) == 'id':
                    # arg.right might be a list for "IN" filters
                    right_value = getattr(getattr(arg, "right", None), "value", getattr(arg, "right", None))
                    if isinstance(right_value, list):
                        filtered = [e for e in filtered if e.id in right_value]
                    else:
                        filtered = [e for e in filtered if e.id == right_value]
                elif getattr(arg.left, 'name', None) == 'start_time':
                    filtered = [e for e in filtered if e.start_time > arg.right]
                elif getattr(arg.left, 'name', None) == 'end_time':
                    filtered = [e for e in filtered if e.end_time < arg.right]
        return MockEventQuery(filtered)

    def order_by(self, key_func):
        try:
            ordered = sorted(self._events, key=lambda e: getattr(e, key_func.key))
        except AttributeError:
            ordered = self._events
        return MockEventQuery(ordered)

    def all(self):
        return self._events


class MockEventIdSubquery:
    def __init__(self, event_ids):
        self._event_ids = event_ids
    def select(self):
        return self._event_ids


class MockParticipant:
    def __init__(self, event_id, user_id, role):
        self.event_id = event_id
        self.user_id = user_id
        self.role = role


class MockParticipantQuery:
    def __init__(self, participants):
        self._participants = participants

    def filter(self, *args):
        filtered = self._participants
        for arg in args:
            if callable(arg):
                filtered = [p for p in filtered if arg(p)]
            else:
                left_name = getattr(arg.left, "name", None)
                right_value = getattr(getattr(arg, "right", None), "value", getattr(arg, "right", None))
                if left_name == "user_id":
                    filtered = [p for p in filtered if p.user_id == right_value]
                elif left_name == "role":
                    filtered = [p for p in filtered if p.role == right_value]
                elif left_name == "event_id":
                    filtered = [p for p in filtered if p.event_id == right_value]
        return MockParticipantQuery(filtered)

    def subquery(self):
        return MockEventIdSubquery([p.event_id for p in self._participants])

    def select(self):
        return [p.event_id for p in self._participants]

    def all(self):
        return self._participants


class MockSession:
    def __init__(self, events=None, users=None, participants=None):
        self._events = events or []
        self._users = users or [MockUser()]
        self._participants = participants or []
        self._event_id_counter = 1

    def add(self, obj):
        if isinstance(obj, (MockEvent, Event)) and obj.id is None:
            obj.id = self._event_id_counter
            self._event_id_counter += 1
            self._events.append(obj)
        elif isinstance(obj, (MockParticipant, Participant)):
            self._participants.append(obj)

    def commit(self):
        pass

    def refresh(self, _):
        pass

    def query(self, model):
        if hasattr(model, "__name__"):
            if model.__name__ == "Event":
                return MockEventQuery(self._events)
            elif model.__name__ == "Participant":
                return MockParticipantQuery(self._participants)
            elif model.__name__ == "User":
                return MockUserQuery(self._users)
        elif hasattr(model, "class_") and model.class_.__name__ == "Participant":
            return MockParticipantQuery(self._participants)


class MockUser:
    def __init__(self, id=1, email="mockuser@example.com", first_name="Mock", last_name="User"):
        self.id = id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name


class MockUserQuery:
    def __init__(self, users):
        self._users = users

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self._users[0] if self._users else None


# --- Dependency Overrides ---
def mock_get_current_user_from_token():
    return MockUser()


# --- Tests ---
def test_create_event_success():
    # --- Arrange ---
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }
    mock_db = MockSession()

    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = lambda: mock_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides.clear()

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "string"
    assert "id" in data


def test_create_event_adds_user_to_participant_success():
    # --- Arrange ---
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }
    mock_db = MockSession()

    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = lambda: mock_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)
    event_id = response.json()["id"]

    # --- Clean-up ---
    app.dependency_overrides.clear()

    # --- Assert ---
    assert response.status_code == 200
    # Check that the participant was added with correct event_id, user_id, and role
    assert any(
        participant.event_id == event_id and participant.user_id == 1 and participant.role == "host"
        for participant in mock_db._participants
    )


def test_create_event_missing_fields():
    # --- Arrange ---
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z"
    }
    mock_db = MockSession()

    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = lambda: mock_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides.clear()

    # --- Assert ---
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert any("title" in err["loc"] for err in data["detail"])


def test_create_event_unauthenticated():
    # --- Arrange ---
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }
    mock_db = MockSession()

    app.dependency_overrides[get_db] = lambda: mock_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides.clear()

    # --- Assert ---
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not logged in"


def test_get_events_host_success():
    mock_events = [
        MockEvent(id=1, title="Event 1"),
        MockEvent(id=2, title="Event 2"),
    ]
    mock_participants = [
        MockParticipant(event_id=1, user_id=1, role="host"),
        MockParticipant(event_id=1, user_id=2, role="participant"),
        MockParticipant(event_id=2, user_id=2, role="host"),
        MockParticipant(event_id=2, user_id=1, role="participant"),
    ]
    mock_db = MockSession(events=mock_events, participants=mock_participants)

    app.dependency_overrides[get_current_user_from_token] = lambda: MockUser(id=1)
    app.dependency_overrides[get_db] = lambda: mock_db

    response = client.get("/api/private/events/?role=host&time=all")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    returned_ids = {event["id"] for event in data}
    assert returned_ids == {1}
