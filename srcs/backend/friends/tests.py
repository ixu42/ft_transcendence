from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse

CustomUser = get_user_model()


@override_settings(AXES_ENABLED=False)
class TestFriendListCreate(TestCase):
    def setUp(self):
        """Set up test users before each test."""
        self.user1 = CustomUser.objects.create_user(
            username="user1", password="password1"
        )
        self.user2 = CustomUser.objects.create_user(
            username="user2", password="password2"
        )

        self.client.login(username="user1", password="password1")

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
        """Test that an unauthenticated user gets a 401 response."""
        self.client.logout()
        response = self.client.get(self.url1)

        self.assertEqual(response.status_code, 401)
