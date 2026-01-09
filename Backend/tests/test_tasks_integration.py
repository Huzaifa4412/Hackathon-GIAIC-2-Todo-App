"""
Integration tests for task endpoints.

Tests the complete task CRUD flow with authentication.
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestTaskIntegration:
    """Integration tests for task endpoints."""

    def test_create_task_flow(self, client: TestClient, session):
        """Test creating a task with authentication."""
        # Create user and get token
        from app.models.user import User
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_task_test",
            email="taskuser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        token = create_jwt_token(user.id)

        # Create task
        response = client.post(
            "/api/tasks",
            json={
                "title": "Integration Test Task",
                "description": "Testing task creation",
                "status": "pending",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["title"] == "Integration Test Task"
        assert data["data"]["task"]["user_id"] == user.id

    def test_list_tasks_empty(self, client: TestClient, session):
        """Test listing tasks when user has no tasks."""
        # Create user and get token
        from app.models.user import User
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_empty_test",
            email="empty@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        token = create_jwt_token(user.id)

        # List tasks
        response = client.get(
            "/api/tasks",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["tasks"] == []
        assert data["data"]["total"] == 0

    def test_list_tasks_with_data(self, client: TestClient, session):
        """Test listing tasks when user has tasks."""
        # Create user and tasks
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_list_test",
            email="listuser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        task1 = Task(
            id="tsk_list_1",
            user_id=user.id,
            title="Task 1",
            status="pending",
        )
        task2 = Task(
            id="tsk_list_2",
            user_id=user.id,
            title="Task 2",
            status="completed",
        )
        session.add(task1)
        session.add(task2)
        session.commit()

        token = create_jwt_token(user.id)

        # List tasks
        response = client.get(
            "/api/tasks",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["tasks"]) == 2
        assert data["data"]["total"] == 2

    def test_get_task_by_id(self, client: TestClient, session):
        """Test getting a specific task by ID."""
        # Create user and task
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_get_test",
            email="getuser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        task = Task(
            id="tsk_get_test",
            user_id=user.id,
            title="Get Test Task",
            description="Testing get endpoint",
        )
        session.add(task)
        session.commit()

        token = create_jwt_token(user.id)

        # Get task
        response = client.get(
            f"/api/tasks/{task.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["id"] == task.id
        assert data["data"]["task"]["title"] == "Get Test Task"

    def test_update_task_flow(self, client: TestClient, session):
        """Test updating a task."""
        # Create user and task
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_update_test",
            email="updateuser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        task = Task(
            id="tsk_update_test",
            user_id=user.id,
            title="Original Title",
            status="pending",
        )
        session.add(task)
        session.commit()

        token = create_jwt_token(user.id)

        # Update task
        response = client.put(
            f"/api/tasks/{task.id}",
            json={
                "title": "Updated Title",
                "status": "completed",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["title"] == "Updated Title"
        assert data["data"]["task"]["status"] == "completed"

    def test_delete_task_flow(self, client: TestClient, session):
        """Test deleting a task."""
        # Create user and task
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_delete_test",
            email="deleteuser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        task = Task(
            id="tsk_delete_test",
            user_id=user.id,
            title="Delete Test Task",
        )
        session.add(task)
        session.commit()

        token = create_jwt_token(user.id)

        # Delete task
        response = client.delete(
            f"/api/tasks/{task.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 204

    def test_user_data_isolation(self, client: TestClient, session):
        """Test that users can only access their own tasks."""
        # Create two users
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user1 = User(
            id="usr_isolation_1",
            email="user1@example.com",
            name=hash_password("Password123!"),
        )
        user2 = User(
            id="usr_isolation_2",
            email="user2@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user1)
        session.add(user2)
        session.commit()

        # Create task for user1
        task = Task(
            id="tsk_isolation_test",
            user_id=user1.id,
            title="User1 Task",
        )
        session.add(task)
        session.commit()

        # User1 can access the task
        token1 = create_jwt_token(user1.id)
        response = client.get(
            f"/api/tasks/{task.id}",
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert response.status_code == 200

        # User2 cannot access user1's task
        token2 = create_jwt_token(user2.id)
        response = client.get(
            f"/api/tasks/{task.id}",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert response.status_code == 404  # Task not found for user2

    def test_task_filtering_by_status(self, client: TestClient, session):
        """Test filtering tasks by status."""
        # Create user and tasks with different statuses
        from app.models.user import User
        from app.models.task import Task
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_filter_test",
            email="filteruser@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        task1 = Task(
            id="tsk_filter_1",
            user_id=user.id,
            title="Pending Task",
            status="pending",
        )
        task2 = Task(
            id="tsk_filter_2",
            user_id=user.id,
            title="Completed Task",
            status="completed",
        )
        session.add(task1)
        session.add(task2)
        session.commit()

        token = create_jwt_token(user.id)

        # Filter by pending
        response = client.get(
            "/api/tasks?status=pending",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["tasks"]) == 1
        assert data["data"]["tasks"][0]["status"] == "pending"

        # Filter by completed
        response = client.get(
            "/api/tasks?status=completed",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["tasks"]) == 1
        assert data["data"]["tasks"][0]["status"] == "completed"
