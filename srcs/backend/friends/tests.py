from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
import json
from .models import FriendRequest

CustomUser = get_user_model()


class BaseTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = CustomUser.objects.create_user(
            username="user1", password="password1"
        )
        cls.user2 = CustomUser.objects.create_user(
            username="user2", password="password2"
        )

    def login(self, user, password=None):
        if password is None:
            password = "password1" if user == self.user1 else "password2"
        self.client.login(username=user.username, password=password)

    def tearDown(self):
        self.client.logout()


@override_settings(AXES_ENABLED=False)
class TestFriendListCreate(BaseTestCase):
    def setUp(self):
        self.login(self.user1)
        self.url1 = reverse("users:friends:friend_list_create", args=[self.user1.id])
        self.url2 = reverse("users:friends:friend_list_create", args=[self.user2.id])

    def test_list_friend_list_success(self):
        self.user1.friends.add(self.user2)
        response = self.client.get(self.url1)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["friends"]), 1)
        self.assertEqual(data["friends"][0]["username"], "user2")

    def test_list_another_user_friends(self):
        self.user1.friends.add(self.user2)
        response = self.client.get(self.url2)

        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertEqual(
            data["errors"], "You do not have permission to view friends of this user."
        )

    def test_send_request_success(self):
        response = self.client.post(self.url2)

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["message"], "Friend request sent.")

    def test_send_request_to_self(self):
        response = self.client.post(self.url1)

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(
            data["errors"], "You cannot send a friend request to yourself."
        )

    def test_send_request_to_nonexistent_user(self):
        url_invalid_id = reverse("users:friends:friend_list_create", args=[4242])
        response = self.client.post(url_invalid_id)

        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(data["errors"], "Recipient of the friend request not found.")

    def test_no_friends(self):
        """Test response when the user has no friends."""
        response = self.client.get(self.url1)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["friends"], [])

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.url1)

        self.assertEqual(response.status_code, 401)


@override_settings(AXES_ENABLED=False)
class TestListFriendRequests(BaseTestCase):
    def setUp(self):
        self.login(self.user1)

        url_send_request = reverse(
            "users:friends:friend_list_create", args=[self.user2.id]
        )
        self.client.post(url_send_request)

        self.url1 = reverse("users:friends:list_friend_requests", args=[self.user1.id])
        self.url2 = reverse("users:friends:list_friend_requests", args=[self.user2.id])

    def test_list_friend_requests_success(self):
        self.client.login(username="user2", password="password2")
        response = self.client.get(self.url2)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["friend_requests"]), 1)
        self.assertEqual(data["friend_requests"][0]["sender"], "user1")

    def test_list_friend_requests_no_perm(self):
        self.client.login(username="user2", password="password2")
        response = self.client.get(self.url1)

        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertEqual(
            data["errors"],
            "You do not have permission to view another user's friend requests.",
        )


@override_settings(AXES_ENABLED=False)
class TestHandleFriendRequest(BaseTestCase):
    def setUp(self):
        # Log in user1 to send a request to user2
        self.login(self.user1)
        url_send_request = reverse(
            "users:friends:friend_list_create", args=[self.user2.id]
        )
        self.client.post(url_send_request)
        self.client.logout()

        # Fetch request id from database
        request = FriendRequest.objects.get(
            sender=self.user1, receiver=self.user2, status="pending"
        )
        self.request_id = request.id

        # Log in user2 to handle request
        self.login(self.user2)

    def test_accept_friend_request(self):
        url = reverse(
            "users:friends:handle_friend_request", args=[self.user2.id, self.request_id]
        )
        request_body = {"accepted": True}
        response = self.client.post(
            url, json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Friend request accepted.")

    def test_reject_friend_request(self):
        url = reverse(
            "users:friends:handle_friend_request", args=[self.user2.id, self.request_id]
        )
        request_body = {"accepted": False}
        response = self.client.post(
            url, json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Friend request rejected.")

    def test_accept_invalid_friend_request(self):
        url = reverse(
            "users:friends:handle_friend_request",
            args=[self.user2.id, self.request_id + 1],
        )
        request_body = {"accepted": True}
        response = self.client.post(
            url, json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(data["errors"], "friend request not found")


@override_settings(AXES_ENABLED=False)
class TestRemoveFriend(BaseTestCase):
    def setUp(self):
        self.login(self.user1)
        self.user1.friends.add(self.user2)
        self.url = reverse(
            "users:friends:remove_friend", args=[self.user1.id, self.user2.id]
        )

    def make_request(self, url=None):
        if not url:
            url = self.url
        return self.client.delete(url)

    def test_remove_friend_success(self):
        response = self.make_request()
        self.assertEqual(response.status_code, 204)
        self.assertFalse(self.user1.friends.filter(id=self.user2.id).exists())

    def test_target_user_nonexistent(self):
        url = reverse("users:friends:remove_friend", args=[self.user1.id, 4242])
        response = self.make_request(url)
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(
            data["errors"],
            "friend user(id=4242) not found",
        )

    def test_target_user_not_a_friend(self):
        self.user1.friends.remove(self.user2)
        response = self.make_request()
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(
            data["errors"],
            f"Not friends with this user(id={self.user2.id}).",
        )
