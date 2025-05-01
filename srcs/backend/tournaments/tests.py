import json
from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth import get_user_model
from backend.decorators import validate_user_id_query_param
from .models import Tournament, TournamentPlayer

User = get_user_model()


class BaseTestCase(TestCase):
    def setUp_tournament_with_players(self):
        self.user1 = User.objects.create(username="user1")
        self.user2 = User.objects.create(username="user2")
        self.user3 = User.objects.create(username="user3")
        self.tournament = Tournament.objects.create(
            name="test tournament", creator=self.user1
        )
        for user in [self.user1, self.user2, self.user3]:
            TournamentPlayer.objects.create(tournament=self.tournament, player=user)

    def login(self, user):
        session = self.client.session
        session["user_id"] = user.id
        session.save()
        self.client.cookies[f"session_{user.id}"] = session.session_key

    def tearDown(self):
        session_cookies = [
            key for key in self.client.cookies.keys() if key.startswith("session_")
        ]

        for key in session_cookies:
            self.client.cookies.pop(key, None)

        self.client.session.clear()

    def make_request(self, url, data=None, method="PATCH"):
        if not data:
            if method == "PATCH":
                return self.client.patch(url)
            return self.client.post(url)
        if method == "PATCH":
            return self.client.patch(url, data=data, content_type="application/json")
        return self.client.post(url, data=data, content_type="application/json")

    def get_url(self, url_name, tournament_id, user_id):
        url = reverse(url_name, args=[tournament_id])
        return f"{url}?user_id={user_id}"


@validate_user_id_query_param
def dummy_view(request):
    return JsonResponse({"message": "User is authenticated."}, status=200)


class TestCustomLoginRequired(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create(username="testuser")

    def test_missing_user_id(self):
        request = self.factory.get("/dummy/")
        response = dummy_view(request)
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "Missing user_id query parameter."}
        )

    def test_invalid_user_id(self):
        request = self.factory.get("/dummy/", {"user_id": "abc"})
        response = dummy_view(request)
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "Invalid user_id value passed in query param."}
        )

    def test_missing_session_cookie(self):
        request = self.factory.get("/dummy/", {"user_id": str(self.user.id)})
        response = dummy_view(request)
        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(response.content, {"errors": "User is not authenticated."})

    def test_authenticated_user(self):
        cookie_name = f"session_{self.user.id}"
        request = self.factory.get("/dummy/", {"user_id": str(self.user.id)})
        request.COOKIES[cookie_name] = "dummy_session_value"
        response = dummy_view(request)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"message": "User is authenticated."})


class TestCreateTournament(BaseTestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")
        url = reverse("tournaments:create_tournament")
        self.url = f"{url}?user_id={self.user.id}"
        self.login(self.user)

    def test_create_tournament_success(self):
        response = self.make_request(
            self.url,
            json.dumps({"tournament_name": ""}),
            "POST",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Tournament.objects.count(), 1)
        self.assertJSONEqual(
            response.content,
            {
                "message": f"{self.user.username} created tournament.",
                "tournament_id": 1,
                "tournament_name": f"{self.user.username}'s tournament",
            },
        )
        tournament = Tournament.objects.first()
        self.assertEqual(tournament.name, f"{self.user.username}'s tournament")

    def test_create_tournament_invalid_json_input(self):
        response = self.make_request(self.url, "invalid", "POST")
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {"errors": "Invalid JSON input."})


class TestJoinTournament(BaseTestCase):
    def setUp(self):
        self.user1 = User.objects.create(username="user1")
        self.user2 = User.objects.create(username="user2")
        self.tournament = Tournament.objects.create(
            name="test tournament", creator=self.user1
        )
        self.url_name = "tournaments:join_tournament"
        self.url = self.get_url(self.url_name, self.tournament.id, self.user2.id)
        self.login(self.user2)

    def test_join_tournament_success(self):
        response = self.make_request(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "message": f"{self.user2.username} joined tournament.",
                "tournament_id": self.tournament.id,
                "tournament_name": self.tournament.name,
            },
        )

    def test_join_tournament_tournament_not_found(self):
        url = self.get_url(self.url_name, 4242, self.user2.id)
        response = self.make_request(url)
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(
            response.content,
            {"errors": "Tournament not found with tournament_id 4242."},
        )

    def test_join_tournament_tournament_full(self):
        for i in range(Tournament.MAX_PLAYERS):
            user = User.objects.create(username=f"new_user{i}")
            TournamentPlayer.objects.create(tournament=self.tournament, player=user)
        response = self.make_request(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {"errors": "['Tournament is full']"})


class TestStartTournament(BaseTestCase):
    def setUp(self):
        self.setUp_tournament_with_players()
        self.url_name = "tournaments:start_tournament"
        self.url = self.get_url(self.url_name, self.tournament.id, self.user3.id)
        self.login(self.user3)

    def test_start_tournament_success(self):
        response = self.make_request(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "message": "Tournament started.",
                "tournament_id": self.tournament.id,
                "tournament_name": self.tournament.name,
            },
        )

    def test_start_tournament_tournament_not_found(self):
        response = self.make_request(self.get_url(self.url_name, 4242, self.user3.id))
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(
            response.content,
            {"errors": "Tournament not found with tournament_id 4242."},
        )

    def test_start_tournament_2_players(self):
        self.tournament.players.remove(self.user3)
        response = self.make_request(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {"errors": "['Cannot start tournament with less than 3 players.']"},
        )

    def test_start_tournament_by_non_player(self):
        non_player = User.objects.create(username="non_player")
        self.login(non_player)
        response = self.make_request(
            self.get_url(self.url_name, self.tournament.id, non_player.id)
        )

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {"errors": "['Only tournament players can start the tournament.']"},
        )

    def test_start_completed_tournament(self):
        self.tournament.status = Tournament.TournamentStatus.COMPLETED
        self.tournament.save()
        response = self.make_request(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "['Tournament has already completed.']"}
        )


class TestSaveTournamentStats(BaseTestCase):
    def setUp(self):
        self.setUp_tournament_with_players()
        self.start_tournament()

        self.url_name = "tournaments:save_tournament_stats"
        self.url = self.get_url(self.url_name, self.tournament.id, self.user3.id)
        self.login(self.user3)

    def start_tournament(self):
        self.tournament.status = Tournament.TournamentStatus.ACTIVE
        self.tournament.started_at = timezone.now()
        self.tournament.save()

    def test_save_tournament_stats_success(self):
        response = self.make_request(self.url, json.dumps({"winner_id": self.user3.id}))

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "message": "Tournament stats saved.",
                "tournament_id": self.tournament.id,
                "tournament_name": self.tournament.name,
            },
        )
        self.tournament.refresh_from_db()
        self.assertEqual(self.tournament.status, Tournament.TournamentStatus.COMPLETED)
        self.assertEqual(self.tournament.winner, self.user3)

    def test_save_tournament_stats_tournament_not_found(self):
        response = self.make_request(
            self.get_url(self.url_name, 4242, self.user3.id),
            json.dumps({"winner_id": self.user3.id}),
        )
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(
            response.content,
            {"errors": "Tournament not found with tournament_id 4242."},
        )

    def test_save_tournament_stats_invalid_json_input(self):
        response = self.make_request(self.url, "invalid")
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {"errors": "Invalid JSON input."})

    def test_save_tournament_stats_missing_winner_id(self):
        response = self.make_request(self.url, json.dumps({}))

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "Missing winner_id field in request body."}
        )

    def test_save_tournament_winner_not_found(self):
        response = self.make_request(self.url, json.dumps({"winner_id": 4242}))
        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(
            response.content, {"errors": "Winner not found with winner_id 4242."}
        )

    def test_save_tournament__by_non_player(self):
        non_player = User.objects.create(username="non_player")
        self.login(non_player)
        response = self.make_request(
            self.get_url(self.url_name, self.tournament.id, non_player.id),
            json.dumps({"winner_id": self.user3.id}),
        )

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {"errors": "['Only tournament players can save stats.']"},
        )

    def test_save_tournament_stats_tournament_not_active(self):
        self.tournament.status = Tournament.TournamentStatus.PENDING
        self.tournament.save()
        response = self.make_request(self.url, json.dumps({"winner_id": self.user3.id}))
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content, {"errors": "['Tournament is not active.']"}
        )

    def test_save_tournament_stats_winner_not_in_tournament(self):
        user4 = User.objects.create(username="user4")
        response = self.make_request(self.url, json.dumps({"winner_id": user4.id}))
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {"errors": "['Winner must be a player in the tournament.']"},
        )
