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
        id=1,
        title="Mock Event",
        description="Mock event for testing",
        start_time="2025-11-25T22:17:41.110000Z",
        end_time="2025-11-26T22:17:41.110000Z",
    ):
        self.id = id
        self.title = title
        self.description = description
        self.start_time = start_time
        self.end_time = end_time


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
        # Return a mock subquery object with .select() returning event_ids
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
                return MockEventIdSubquery(self._events)
            elif model.__name__ == "User":
                return MockUserQuery(self._users)
            elif model.__name__ == "Participant":
                return MockParticipantQuery(self._participants)
        # Handle SQLAlchemy columns (like Participant.event_id)
        elif hasattr(model, "class_") and model.class_.__name__ == "Participant":
            return MockParticipantQuery(self._participants)
        # Add more as needed


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
        p.event_id == event_id and p.user_id == 1 and p.role == "host"
        for p in mock_db._participants
    )


def test_create_event_missing_fields():
    # --- Arrange ---
    # Set event details
    json = {
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


# def test_create_event_unauthenticated():
#     # TODO: add test
#     pass


# def test_get_events_host_success():
#     # --- Arrange ---
#     global mock_db
#     mock_events = [
#         MockEvent(id=1, title="Event 1"),
#         MockEvent(id=2, title="Event 2"),
#         MockEvent(id=3, title="Event 3"),
#     ]

#     mock_participants = [
#         MockParticipant(event_id=1, user_id=1, role="host"),
#         MockParticipant(event_id=2, user_id=1, role="host"),
#         MockParticipant(event_id=3, user_id=2, role="host"),
#     ]
#     mock_db = MockSession(events=mock_events, participants=mock_participants)
#     app.dependency_overrides[get_current_user_from_token] = (
#         mock_get_current_user_from_token
#     )
#     app.dependency_overrides[get_db] = mock_get_db

#     # --- Act ---
#     response = client.get("/api/private/events/?role=host&time=all")

#     # --- Clean-up ---
#     app.dependency_overrides = {}

#     # --- Assert ---
#     assert response.status_code == 200
#     data = response.json()
#     assert len(data) == 2
#     returned_ids = {event["id"] for event in data}
#     assert returned_ids == {1, 2}


# def test_create_event_success():
#     # Arrange
#     mock_event = MockEvent()
#     mock_db = MockSession(events=[mock_event])

#     def mock_get_current_user_from_token():
#         return MockUser()

#     def mock_get_db():
#         return mock_db

#     app.dependency_overrides[get_current_user_from_token] = mock_get_current_user_from_token
#     app.dependency_overrides[get_db] = mock_get_db

#     json = {
#         "title": "Test",
#         "description": "This is a test event.",
#         "host_id": 1,
#         "start_time": "2025-11-25T22:17:41.110Z",
#         "end_time": "2025-11-26T22:17:41.110Z"
#     }

#     # Act
#     response = client.post("api/events/", json=json)

#     # Clean-up
#     app.dependency_overrides = {}

#     # Assert
#     assert response.status_code == 200
#     data = response.json()
#     assert data == {
#         "title": "Test",
#         "description": "This is a tests event.",
#         "host_id": 0,
#         "start_time": "2025-11-25T22:17:41.110Z",
#         "end_time": "2025-11-26T22:17:41.110Z",
#         "id": 1,
#         "host_name": "Test User"
#     }


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
