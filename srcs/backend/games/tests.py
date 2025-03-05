from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
import json
from .models import Game

User = get_user_model()


@override_settings(AXES_ENABLED=False)
class TestSaveGameStats(TestCase):
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username="player1", password="password1")
        self.user2 = User.objects.create_user(username="player2", password="password2")
        self.other_user = User.objects.create_user(
            username="other", password="password3"
        )

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
        self.client.login(username="player1", password="password1")
        response = self.make_request()

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 10)
        self.assertEqual(self.game.player2_score, 5)
        self.assertEqual(self.game.winner, self.user1)

    def test_save_game_stats_player2_wins(self):
        self.client.login(username="player1", password="password1")
        response = self.make_request(
            request_body=json.dumps({"player1_score": 8, "player2_score": 10})
        )

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 8)
        self.assertEqual(self.game.player2_score, 10)
        self.assertEqual(self.game.winner, self.user2)

    def test_save_game_stats_tie(self):
        self.client.login(username="player1", password="password1")
        response = self.make_request(
            request_body=json.dumps({"player1_score": 10, "player2_score": 10})
        )

        self.game.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.game.player1_score, 10)
        self.assertEqual(self.game.player2_score, 10)
        self.assertEqual(self.game.winner, None)

    def test_save_game_stats_invalid_json(self):
        self.client.login(username="player1", password="password1")
        response = self.make_request(request_body="invalid_json")
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {"errors": "Invalid JSON input."})

    def test_save_game_stats_invalid_scores(self):
        self.client.login(username="player1", password="password1")
        response = self.make_request(request_body=json.dumps({"player1_score": 10}))
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": {"player2_score": ["This field is required."]}}
        )

    def test_save_game_stats_unauthenticated(self):
        response = self.make_request()
        self.assertEqual(response.status_code, 401)

    def test_save_game_stats_not_part_of_game(self):
        self.client.login(username="other", password="password3")
        response = self.make_request()
        self.assertEqual(response.status_code, 403)
        self.assertJSONEqual(
            response.content, {"errors": "You are not part of this game."}
        )

    def test_save_game_stats_game_not_found(self):
        self.client.login(username="player1", password="password1")
        url = reverse("games:save_game_stats", args=[4242])
        response = self.make_request(url)
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(response.content, {"errors": "Game not found."})
