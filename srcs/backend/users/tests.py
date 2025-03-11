from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
import json

User = get_user_model()


class TestRegisterUser(TestCase):
    def setUp(self):
        self.url = reverse("users:register_user")

    def make_request(self, request_body):
        return self.client.post(
            self.url, data=request_body, content_type="application/json"
        )

    def test_register_user_success(self):
        valid_data = {
            "username": "testuser",
            "password1": "securepassword123",
            "password2": "securepassword123",
        }
        response = self.make_request(json.dumps(valid_data))

        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.json())
        self.assertIn("username", response.json())
        data = response.json()
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["message"], "User created.")

    def test_register_user_invalid_json(self):
        response = self.make_request("invalid json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["errors"], "Invalid JSON input.")

    def test_register_user_username_exists(self):
        User.objects.create_user(username="testuser", password="password123")
        existing_data = {
            "username": "testuser",
            "password1": "password123",
            "password2": "password123",
        }
        response = self.make_request(json.dumps(existing_data))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("username", data["errors"])
        self.assertEqual(
            data["errors"]["username"], ["A user with that username already exists."]
        )

    def test_register_user_password_mismatch(self):
        mismatch_data = {
            "username": "testuser",
            "password1": "password123",
            "password2": "password456",
        }
        response = self.make_request(json.dumps(mismatch_data))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("password2", data["errors"])
        self.assertEqual(
            data["errors"]["password2"], ["The two password fields didn’t match."]
        )

    def test_register_user_invalid_data(self):
        invalid_data = {"username": "", "password1": "short", "password2": "short"}
        response = self.make_request(json.dumps(invalid_data))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIsInstance(data["errors"], dict)


class TestLoginUser(TestCase):
    def setUp(self):
        self.url = reverse("users:login_user")

        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )

    def make_request(self, request_body):
        return self.client.post(
            self.url, data=request_body, content_type="application/json"
        )

    def test_login_user_success(self):
        valid_data = {"username": "testuser", "password": "password123"}
        response = self.make_request(json.dumps(valid_data))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Login successful.")

    def test_login_user_already_logged_in(self):
        self.client.force_login(self.user)
        valid_data = {"username": "testuser", "password": "password123"}
        response = self.make_request(json.dumps(valid_data))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "User is already logged in.")

    def test_login_user_username_missing(self):
        missing_username = {"password": "password123"}
        response = self.make_request(json.dumps(missing_username))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "Username and password are required.")


class TestLogoutUser(TestCase):
    def setUp(self):
        self.url = reverse("users:logout_user")

        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )

    def make_request(self):
        return self.client.post(self.url)

    def test_logout_user_success(self):
        self.client.force_login(self.user)
        response = self.make_request()

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Logout successful.")

    def test_logout_user_not_logged_in(self):
        response = self.make_request()

        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "User is not authenticated.")


class TestUserProfile(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )
        self.valid_url = reverse("users:user_profile", args=[self.user.id])
        self.invalid_url = reverse("users:user_profile", args=[self.user.id + 1])

    def test_user_profile_not_found(self):
        self.client.force_login(self.user)
        response = self.client.get(self.invalid_url)

        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(
            data["errors"], "You do not have permission to access this user's profile."
        )

    def test_get_user_profile_success(self):
        self.client.force_login(self.user)
        response = self.client.get(self.valid_url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("avatar", data)
        self.assertIn("email", data)
        self.assertIn("first_name", data)
        self.assertIn("last_name", data)
        self.assertIn("total_wins", data)
        self.assertIn("total_losses", data)

    def test_update_user_profile_success(self):
        self.client.force_login(self.user)
        request_body = {
            "deactivate": False,
            "username": "user42",
        }
        response = self.client.patch(
            self.valid_url,
            data=json.dumps(request_body),
            content_type="application/json",
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "User profile updated.")
        self.assertEqual(self.user.username, "user42")

    def test_update_user_profile_errors(self):
        User.objects.create_user(username="existinguser", password="password123")
        self.client.force_login(self.user)
        request_body = {
            "deactivate": False,
            "username": "existinguser",
        }
        response = self.client.patch(
            self.valid_url,
            data=json.dumps(request_body),
            content_type="application/json",
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("username", data["errors"])
        self.assertEqual(
            data["errors"]["username"], ["A user with that username already exists."]
        )

    def test_deactivate_user_profile_success(self):
        self.client.force_login(self.user)
        request_body = {"deactivate": True}
        response = self.client.patch(
            self.valid_url,
            data=json.dumps(request_body),
            content_type="application/json",
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Account deactivated.")
        self.assertEqual(self.user.is_active, False)

    def test_delete_user_profile_success(self):
        self.client.force_login(self.user)
        response = self.client.delete(self.valid_url)

        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Account deleted.")
        self.assertEqual(User.objects.filter(id=self.user.id).exists(), False)


class TestUpdatePassword(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="securepassword123"
        )
        self.url = reverse("users:update_password", args=[self.user.id])

    def make_request(self, request_body):
        return self.client.post(
            self.url, data=request_body, content_type="application/json"
        )

    def test_update_password_success(self):
        self.client.force_login(self.user)
        request_body = {
            "old_password": "securepassword123",
            "new_password1": "securepassword456",
            "new_password2": "securepassword456",
        }
        response = self.make_request(json.dumps(request_body))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "User password updated.")

    def test_update_password_old_pass_invalid(self):
        self.client.force_login(self.user)
        request_body = {
            "old_password": "invalidpassword123",
            "new_password1": "securepassword456",
            "new_password2": "securepassword456",
        }
        response = self.make_request(json.dumps(request_body))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("old_password", data["errors"])
        self.assertEqual(data["errors"]["old_password"], ["Old password is incorrect."])

    def test_update_password_new_pass_same_as_old(self):
        self.client.force_login(self.user)
        request_body = {
            "old_password": "securepassword123",
            "new_password1": "securepassword123",
            "new_password2": "securepassword123",
        }
        response = self.make_request(json.dumps(request_body))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("new_password1", data["errors"])
        self.assertEqual(
            data["errors"]["new_password1"],
            ["New password cannot be the same as the old one."],
        )

    def test_update_password_new_pass_no_match(self):
        self.client.force_login(self.user)
        request_body = {
            "old_password": "securepassword123",
            "new_password1": "securepassword456",
            "new_password2": "securepassword789",
        }
        response = self.make_request(json.dumps(request_body))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("new_password2", data["errors"])
        self.assertEqual(
            data["errors"]["new_password2"], ["The two password fields didn’t match."]
        )
