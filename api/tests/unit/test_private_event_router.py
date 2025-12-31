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
        self._filters = []
        self._order_by = None

    def all(self):
        return self._events

    def filter(self, *args):
        filtered = self._events
        for arg in args:
            # Only handle Event.id.in_(event_ids) and Event.start_time > now, etc.
            if hasattr(arg, 'left') and hasattr(arg, 'comparator'):
                left = arg.left
                comparator = arg.comparator
                right = arg.right if hasattr(arg, 'right') else None
                # Handle Event.id.in_(event_ids)
                if getattr(left, 'name', None) == 'id' and hasattr(right, '__iter__'):
                    filtered = [e for e in filtered if e.id in list(right)]
                # Handle Event.start_time > now
                elif getattr(left, 'name', None) == 'start_time' and comparator == '>':
                    filtered = [e for e in filtered if e.start_time > right]
                # Handle Event.end_time < now
                elif getattr(left, 'name', None) == 'end_time' and comparator == '<':
                    filtered = [e for e in filtered if e.end_time < right]
        return MockEventQuery(filtered)

    def first(self):
        return self._events[0] if self._events else None

    def order_by(self, *args):
        # Only support ordering by Event.start_time ascending
        ordered = sorted(self._events, key=lambda e: e.start_time)
        return MockEventQuery(ordered)


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

    def filter(self, *args, **kwargs):
        filtered = self._participants
        for arg in args:
            if hasattr(arg, "left") and hasattr(arg, "right"):
                left_name = getattr(arg.left, "name", None)
                right_value = arg.right.value if hasattr(arg.right, "value") else arg.right
                if left_name == "user_id":
                    filtered = [p for p in filtered if p.user_id == right_value]
                elif left_name == "role":
                    filtered = [p for p in filtered if p.role == right_value]
                elif left_name == "event_id":
                    filtered = [p for p in filtered if p.event_id == right_value]
        return MockParticipantQuery(filtered)

    def subquery(self):
        # Only return event_ids from the filtered participants (self._participants)
        return MockEventIdSubquery([p.event_id for p in self._participants])

    def select(self):
        # Not used in this context, but for completeness
        return self

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
            elif model.__name__ == "User":
                return MockUserQuery(self._users)
            elif model.__name__ == "Participant":
                return MockParticipantQuery(self._participants)
        elif hasattr(model, "class_") and model.class_.__name__ == "Participant":
            return MockParticipantQuery(self._participants)


class MockUser:
    id = 1
    email = "mockuser@example.com"
    first_name = "Mock"
    last_name = "User"


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


def mock_get_db():
    return mock_db


# --- Tests ---
def test_create_event_success():
    # --- Arrange ---
    # Set event details
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }

    # Override dependencies
    global mock_db
    mock_db = MockSession()
    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = mock_get_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides = {}

    # --- Assert ---
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "string"
    assert "id" in data


def test_create_event_adds_user_to_participant_success():
    # --- Arrange ---
    # Set event details
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }

    # Override dependencies
    global mock_db
    mock_db = MockSession()
    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = mock_get_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)
    event_id = response.json()["id"]

    # --- Clean-up ---
    app.dependency_overrides = {}

    # --- Assert ---
    assert response.status_code == 200
    # Check that the participant was added with correct event_id, user_id, and role
    assert any(
        participant.event_id == event_id and participant.user_id == 1 and participant.role == "host"
        for participant in mock_db._participants
    )


def test_create_event_missing_fields():
    # --- Arrange ---
    # Set event details
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z"
    }

    # Override dependencies
    global mock_db
    mock_db = MockSession()
    app.dependency_overrides[get_current_user_from_token] = (
        mock_get_current_user_from_token
    )
    app.dependency_overrides[get_db] = mock_get_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides = {}

    # --- Assert ---
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert any("title" in err["loc"] for err in data["detail"])


def test_create_event_unauthenticated():
    # --- Arrange ---
    # Set event details
    json = {
        "address": "string",
        "description": "string",
        "end_time": "2025-12-14T22:19:13.855Z",
        "start_time": "2025-12-14T22:19:13.855Z",
        "title": "string"
    }

    # Override dependencies
    global mock_db
    mock_db = MockSession()
    app.dependency_overrides[get_db] = mock_get_db

    # --- Act ---
    response = client.post("/api/private/events/", json=json)

    # --- Clean-up ---
    app.dependency_overrides = {}

    # --- Assert ---
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not logged in"


# def test_get_events_host_success():
#     # --- Arrange ---
#     # Set query details
#     role = "host"
#     time = "all"

#     # Override dependencies
#     global mock_db
#     mock_events = [
#         MockEvent(id=1, title="Event 1"),
#         MockEvent(id=2, title="Event 2"),
#         MockEvent(id=3, title="Event 3"),
#     ]
#     mock_participants = [
#         MockParticipant(event_id=1, user_id=1, role="host"),
#         MockParticipant(event_id=2, user_id=1, role="participant"),
#         MockParticipant(event_id=3, user_id=2, role="host"),
#     ]
#     mock_db = MockSession(events=mock_events, participants=mock_participants)
#     app.dependency_overrides[get_current_user_from_token] = (
#         mock_get_current_user_from_token
#     )
#     app.dependency_overrides[get_db] = mock_get_db

#     # --- Act ---
#     response = client.get(f"/api/private/events/?role={role}&time={time}")

#     # --- Clean-up ---
#     app.dependency_overrides = {}

#     # --- Assert ---
#     assert response.status_code == 200
#     data = response.json()
#     assert len(data) == 1
#     returned_ids = {event["id"] for event in data}
#     assert returned_ids == {1}


# def test_create_event_success():
#     # TODO: add test

# def test_get_events_participant_success():
#     # TODO: add test
#     pass


# def test_get_events_invalid_type():
#     # TODO: add test
#     pass


# def test_get_event_as_host_success():
#     # TODO: add test
#     pass


# def test_get_event_as_participant_success():
#     # TODO: add test
#     pass


# def test_get_event_not_found():
#     # TODO: add test
#     pass


# def test_update_event_success():
#     # TODO: add test
#     pass


# def test_update_event_not_found():
#     # TODO: add test
#     pass


# def test_update_event_unauthorized():
#     # TODO: add test
#     pass


# def test_delete_event_success():
#     # TODO: add test
#     pass


# def test_delete_event_not_found():
#     # TODO: add test
#     pass


# def test_delete_event_unauthorized():
#     # TODO: add test
#     pass


# def test_event_permissions_host_only():
#     # TODO: add test
#     pass


# def test_event_participation_logic():
#     # TODO: add test
#     pass


# def test_create_event_db_error():
#     # TODO: add test
#     pass


# def test_update_event_db_error():
#     # TODO: add test
#     pass


# def test_delete_event_db_error():
#     # TODO: add test
#     pass
