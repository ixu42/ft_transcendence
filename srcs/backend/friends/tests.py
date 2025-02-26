from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse


@override_settings(AXES_ENABLED=False)
class ListFriendsTestCase(TestCase):
    def setUp(self):
        """Set up test users before each test."""
        User = get_user_model()

        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )
        self.friend = User.objects.create_user(
            username="frienduser", password="password123"
        )

        self.client.login(username="testuser", password="password123")

        self.user.friends.add(self.friend)

    def test_list_friends(self):
        """Test if the list_friends endpoint returns the correct friend list."""
        url = reverse("friends:list_friends")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data["friends"]), 1)
        self.assertEqual(data["friends"][0]["username"], "frienduser")

    def test_no_friends(self):
        """Test response when the user has no friends."""
        self.user.friends.clear()
        url = reverse("friends:list_friends")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["friends"], [])

    def test_unauthenticated_access(self):
        """Test that an unauthenticated user gets a 401 response."""
        self.client.logout()
        url = reverse("friends:list_friends")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 401)
