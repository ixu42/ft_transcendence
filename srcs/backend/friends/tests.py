import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import FriendRequest

User = get_user_model()


class BaseTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create_user(
            username="user1", password="securepassword123"
        )
        cls.user2 = User.objects.create_user(
            username="user2", password="securepassword123"
        )

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


class TestListFriends(BaseTestCase):
    def setUp(self):
        self.login(self.user1)
        self.url = reverse("users:friends:list_friends", args=[self.user1.id])

    def test_list_friend_list_success(self):
        self.user1.friends.add(self.user2)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["friends"]), 1)
        self.assertEqual(data["friends"][0]["username"], "user2")

    def test_no_friends(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["friends"], [])

    def test_unauthenticated_access(self):
        self.client.logout()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 401)


class TestSendOrListFriendRequest(BaseTestCase):
    def setUp(self):
        self.login(self.user1)
        url1 = reverse(
            "users:friends:send_or_list_friend_request", args=[self.user1.id]
        )
        self.url1 = f"{url1}?recipient_username={self.user2.username}"
        self.url1_self = f"{url1}?recipient_username={self.user1.username}"
        self.url1_nonexistent = f"{url1}?recipient_username=nonexistent_user"

        self.url2 = reverse(
            "users:friends:send_or_list_friend_request", args=[self.user2.id]
        )

    def test_send_request_success(self):
        response = self.client.post(self.url1)

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["message"], "Friend request sent.")

    def test_send_request_to_self(self):
        response = self.client.post(self.url1_self)

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(
            data["errors"], "You cannot send a friend request to yourself."
        )

    def test_send_request_to_nonexistent_user(self):
        response = self.client.post(self.url1_nonexistent)

        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "Recipient of the friend request not found.")
    
    def test_send_request_to_a_friend(self):
        self.user1.friends.add(self.user2)
        response = self.client.post(self.url1)

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "Already friends with this user.")
    
    def test_send_request_already_sent(self):
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)
        response = self.client.post(self.url1)

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("errors", data)
        self.assertEqual(data["errors"], "Friend request already sent.")

    def test_list_friend_requests_success(self):
        # Create a friend request (user1 -> user2)
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

        self.login(self.user2)
        response = self.client.get(self.url2)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["friend_requests"]), 1)
        self.assertEqual(data["friend_requests"][0]["sender"], "user1")


class TestHandleFriendRequest(BaseTestCase):
    def setUp(self):
        # Create a friend request (user1 -> user2)
        FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

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
