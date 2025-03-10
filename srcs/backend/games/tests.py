from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
import json
from .models import Game

User = get_user_model()


class BaseTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create users
        cls.user1 = User.objects.create_user(username="user1", password="password1")
        cls.user2 = User.objects.create_user(username="user2", password="password2")
        cls.other_user = User.objects.create_user(
            username="other", password="password3"
        )

    def login(self, user, password=None):
        if password is None:
            password = "password1"
        self.client.login(username=user.username, password=password)

    def tearDown(self):
        self.client.logout()


@override_settings(AXES_ENABLED=False)
class TestCreateLocalGame(BaseTestCase):
    def setUp(self):
        self.url = reverse("games:create_local_game")

    def make_request(self, url=None):
        if not url:
            url = self.url
        return self.client.post(url)

    def test_create_local_game_authenticated_valid_data(self):
        self.login(self.user1)
        response = self.make_request()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Game.objects.count(), 1)
        self.assertEqual(response.json()["message"], "Local game created.")
        game = Game.objects.first()
        guest_player = User.objects.get(username="guest_player")
        self.assertEqual(game.player1, self.user1)
        self.assertEqual(game.player2, guest_player)

    def test_create_local_game_unauthenticated(self):
        response = self.make_request()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(Game.objects.count(), 0)


@override_settings(AXES_ENABLED=False)
class TestCreateAIGame(BaseTestCase):
    def setUp(self):
        self.url = reverse("games:create_ai_game")

    def make_request(self, url=None):
        if not url:
            url = self.url
        return self.client.post(url)

    def test_create_ai_game_authenticated_valid_data(self):
        self.login(self.user1)
        response = self.make_request()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Game.objects.count(), 1)
        self.assertEqual(response.json()["message"], "AI game created.")
        game = Game.objects.first()
        self.assertEqual(game.player1, self.user1)
        self.assertEqual(game.player2, None)

    def test_create_local_game_unauthenticated(self):
        response = self.make_request()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(Game.objects.count(), 0)


@override_settings(AXES_ENABLED=False)
class TestSaveGameStats(BaseTestCase):
    def setUp(self):
        # Create game
        self.game = Game.objects.create(player1=self.user1, player2=self.user2)
        self.url = reverse("games:save_game_stats", args=[self.game.id])

    def make_request(self, url=None, request_body=None):
        if not url:
            url = self.url
        if not request_body:
            request_body = json.dumps({"player1_score": 10, "player2_score": 5})

        return self.client.patch(
            url,
            data=request_body,
            content_type="application/json",
        )

    def test_save_game_stats_player1_wins(self):
        self.login(self.user1)
        response = self.make_request()

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 10)
        self.assertEqual(self.game.player2_score, 5)
        self.assertEqual(self.game.winner, self.user1)

    def test_save_game_stats_player2_wins(self):
        self.login(self.user1)
        response = self.make_request(
            request_body=json.dumps({"player1_score": 8, "player2_score": 10})
        )

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 8)
        self.assertEqual(self.game.player2_score, 10)
        self.assertEqual(self.game.winner, self.user2)

    def test_save_game_stats_tie(self):
        self.login(self.user1)
        response = self.make_request(
            request_body=json.dumps({"player1_score": 10, "player2_score": 10})
        )

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 10)
        self.assertEqual(self.game.player2_score, 10)
        self.assertEqual(self.game.winner, None)

    def test_save_game_stats_invalid_json(self):
        self.login(self.user1)
        response = self.make_request(request_body="invalid_json")
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {"errors": "Invalid JSON input."})

    def test_save_game_stats_invalid_scores(self):
        self.login(self.user1)
        response = self.make_request(request_body=json.dumps({"player1_score": 10}))
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": {"player2_score": ["This field is required."]}}
        )

    def test_save_game_stats_unauthenticated(self):
        response = self.make_request()
        self.assertEqual(response.status_code, 401)

    def test_save_game_stats_not_part_of_game(self):
        self.login(self.other_user, password="password3")
        response = self.make_request()
        self.assertEqual(response.status_code, 403)
        self.assertJSONEqual(
            response.content, {"errors": "You are not part of this game."}
        )

    def test_save_game_stats_game_not_found(self):
        self.login(self.user1)
        url = reverse("games:save_game_stats", args=[4242])
        response = self.make_request(url)
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(response.content, {"errors": "Game not found."})
