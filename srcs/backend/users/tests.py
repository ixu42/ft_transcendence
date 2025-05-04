from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
import json
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
import io
from games.models import Game
from tournaments.models import Tournament

User = get_user_model()


class BaseTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="testuser", password="securepassword123"
        )

    def login(self):
        # Manually create a session for the user
        session = self.client.session
        session["user_id"] = self.user.id
        session.save()

        # Set the custom session cookie
        self.client.cookies[f"session_{self.user.id}"] = session.session_key

    def tearDown(self):
        # Manually clear the custom session cookie
        self.client.cookies.pop(f"session_{self.user.id}", None)

        # Clear session-related data
        self.client.session.clear()


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
        User.objects.create_user(username="testuser", password="securepassword123")
        existing_data = {
            "username": "testuser",
            "password1": "securepassword123",
            "password2": "securepassword123",
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
            "password1": "securepassword123",
            "password2": "securepassword456",
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


class TestLoginUser(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:login_user")

    def make_request(self, request_body):
        return self.client.post(
            self.url, data=request_body, content_type="application/json"
        )

    def test_login_user_success(self):
        valid_data = {"username": "testuser", "password": "securepassword123"}
        response = self.make_request(json.dumps(valid_data))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Login successful.")

    def test_login_user_already_logged_in(self):
        self.login()
        valid_data = {"username": "testuser", "password": "securepassword123"}
        response = self.make_request(json.dumps(valid_data))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "User is already logged in.")

    def test_login_user_username_missing(self):
        missing_username = {"password": "securepassword123"}
        response = self.make_request(json.dumps(missing_username))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "Username and password are required.")


class TestLogoutUser(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:logout_user", args=[self.user.id])

    def make_request(self):
        return self.client.post(self.url)

    def test_logout_user_success(self):
        self.login()
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


class TestUserProfile(BaseTestCase):
    def setUp(self):
        self.valid_url = reverse("users:user_profile", args=[self.user.id])
        self.invalid_url = reverse("users:user_profile", args=[self.user.id + 1])
        self.login()

    def test_get_user_profile_success(self):
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
        request_body = {
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
        User.objects.create_user(username="existinguser", password="securepassword123")
        request_body = {
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

    def test_delete_user_profile_success(self):
        response = self.client.delete(self.valid_url)

        data = response.json()
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Account deleted.")
        self.assertEqual(User.objects.filter(id=self.user.id).exists(), False)


class TestUpdatePassword(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:update_password", args=[self.user.id])
        self.login()

    def make_request(self, request_body):
        return self.client.post(
            self.url, data=request_body, content_type="application/json"
        )

    def test_update_password_success(self):
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


@override_settings(
    MEDIA_ROOT="/tmp/test_media"
)  # Uploaded test files are removed on container removal
class TestUpdateAvatar(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:handle_avatar", args=[self.user.id])
        self.login()

    def make_request(self, request_body={}):
        return self.client.post(self.url, data=request_body)

    def generate_valid_test_image(self):
        """Create a simple in-memory test image."""
        image_io = io.BytesIO()
        # Create a 100x100 blue image
        image = Image.new("RGB", (100, 100), "blue")
        image.save(image_io, format="JPEG")
        # Reset the file pointer to the beginning of image stored in a BytesIO buffer
        image_io.seek(0)
        return SimpleUploadedFile(
            "avatar.jpg", image_io.read(), content_type="image/jpeg"
        )

    def generate_test_image_invalid_ext(self):
        image_io = io.BytesIO()
        image = Image.new("RGB", (100, 100), "blue")
        image.save(image_io, format="GIF")
        image_io.seek(0)
        return SimpleUploadedFile(
            "avatar.gif", image_io.read(), content_type="image/gif"
        )

    def generate_test_image_invalid_size(self):
        from PIL import Image

        # Set a large limit for image pixels
        Image.MAX_IMAGE_PIXELS = 1000000000

        image_io = io.BytesIO()
        # Approx. 3.35 MB | len(image_io.getvalue()) / (1024 * 1024) to check file size in MB
        image = Image.new("RGB", (15000, 15000), "blue")
        image.save(image_io, format="JPEG")
        image_io.seek(0)

        return SimpleUploadedFile(
            "avatar.jpg", image_io.read(), content_type="image/jpeg"
        )

    def test_update_avatar_success(self):
        image = self.generate_valid_test_image()
        response = self.make_request(request_body={"avatar": image})

        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertIn("avatar_url", data)

    def test_update_avatar_no_file_uploaded(self):
        response = self.make_request()
        self.assertEqual(response.status_code, 400)
        self.assertIn("errors", response.json())
        self.assertEqual(response.json()["errors"], "No file uploaded.")

    def test_update_avatar_invalid_file_ext(self):
        image = self.generate_test_image_invalid_ext()
        response = self.make_request(request_body={"avatar": image})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("avatar", data["errors"])
        self.assertEqual(
            data["errors"]["avatar"],
            [
                "File extension “gif” is not allowed. Allowed extensions are: jpg, jpeg, png."
            ],
        )

    def test_update_avatar_size_too_large(self):
        image = self.generate_test_image_invalid_size()
        response = self.make_request(request_body={"avatar": image})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertIn("avatar", data["errors"])
        self.assertEqual(
            data["errors"]["avatar"],
            ["File size exceeds the limit 3.0 MB."],
        )


class TestAnonymizeUser(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:anonymize_user", args=[self.user.id])

    def test_anonymize_user(self):
        self.login()

        response = self.client.patch(self.url)
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {"message": "Your data has been anonymized. Logging out..."},
        )

        self.assertTrue(self.user.is_anonymized)
        self.assertNotEqual(self.user.username, "testuser")
        self.assertNotEqual(self.user.email, "testuser@example.com")
        self.assertFalse(self.user.has_usable_password())

        # Check the user is logged out (session cookie marked for deletion)
        session_cookie = self.client.cookies.get(f"session_{self.user.id}")
        self.assertIsNotNone(session_cookie)
        self.assertEqual(session_cookie.value, "")  # Session should be cleared
        self.assertEqual(session_cookie["expires"], "Thu, 01 Jan 1970 00:00:00 GMT")

    def test_anonymize_already_anonymized_user(self):
        self.user.anonymize()
        self.login()

        response = self.client.patch(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "User is already anonymized."}
        )


class TestMatchHistory(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:match_history", args=[self.user.id])
        self.login()

        Game.objects.create(
            player1=self.user,
            player2=None,
            winner=self.user,
            player1_score=10,
            player2_score=5,
        )

    def test_match_history_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("match_history", data)
        self.assertEqual(len(data["match_history"]), 1)
        game_data = data["match_history"][0]
        self.assertIn("game_id", game_data)
        self.assertIn("date_played", game_data)
        self.assertIn("player1", game_data)
        self.assertIn("player2", game_data)
        self.assertIn("winner", game_data)
        self.assertIn("player1_score", game_data)
        self.assertIn("player2_score", game_data)
        self.assertEqual(game_data["player1"], self.user.username)
        self.assertEqual(game_data["player2"], "AI")
        self.assertEqual(game_data["winner"], self.user.username)
        self.assertEqual(game_data["player1_score"], 10)
        self.assertEqual(game_data["player2_score"], 5)


class TestParticipatedTournaments(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:participated_tournaments", args=[self.user.id])
        self.login()

        self.other_user = User.objects.create_user(
            username="otheruser", password="securepassword123"
        )

        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            creator=self.user,
            status=Tournament.TournamentStatus.PENDING,
        )
        self.tournament.players.add(self.user)
        self.tournament.players.add(self.other_user)

    def test_participated_tournaments_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("participated_tournaments", data)
        tournaments_data = data["participated_tournaments"]
        self.assertEqual(len(tournaments_data), 1)
        tournament_data = tournaments_data[0]
        self.assertIn("id", tournament_data)
        self.assertIn("name", tournament_data)
        self.assertIn("status", tournament_data)
        self.assertIn("started_at", tournament_data)
        self.assertIn("players", tournament_data)
        self.assertEqual(tournament_data["name"], "Test Tournament")
        self.assertEqual(tournament_data["status"], "PENDING")
        self.assertEqual(len(tournament_data["players"]), 2)
        self.assertIn(self.user.username, tournament_data["players"])
        self.assertIn(self.other_user.username, tournament_data["players"])


class TestLeaderboard(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:leaderboard")

        other_user = User.objects.create(
            username="testuser2", password="securepassword123"
        )
        self.simulate_game(self.user, None, self.user, 10, 5)
        self.simulate_game(self.user, other_user, other_user, 5, 10)

    def simulate_game(self, player1, player2, winner, player1_score, player2_score):
        Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score,
            completed=True,
        )

    def assert_leaderboard_entry(self, entry, username, total_wins, win_rate, rank):
        self.assertIn("id", entry)
        self.assertIn("username", entry)
        self.assertIn("avatar", entry)
        self.assertIn("total_wins", entry)
        self.assertIn("win_rate", entry)
        self.assertIn("rank", entry)

        self.assertEqual(entry["username"], username)
        self.assertEqual(entry["total_wins"], total_wins)
        self.assertEqual(entry["win_rate"], win_rate)
        self.assertEqual(entry["rank"], rank)

    def test_leaderboard_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assert_leaderboard_entry(data[0], "testuser2", 1, 100.0, 1)
        self.assert_leaderboard_entry(data[1], "testuser", 1, 50.0, 2)


class TestHeartbeat(BaseTestCase):
    def setUp(self):
        self.url = reverse("users:heartbeat", args=[self.user.id])
        self.login()

    def test_heartbeat_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Heartbeat updated."})

        # Check if the last_active field has been updated
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.last_active)
        self.assertTrue(self.user.last_active <= timezone.now())
