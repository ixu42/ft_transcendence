# livechat/views.py
from django.shortcuts import render, redirect
from .models import Message, ChatRoom
from django.contrib.auth.decorators import login_required

@login_required
def live_chat(request, room_name):
    # Fetch the chat room by name
    room, created = ChatRoom.objects.get_or_create(name=room_name)
    
    # Get all messages in the current room, ordered by timestamp
    messages = Message.objects.filter(room=room).order_by('timestamp')
    
    if request.method == "POST":
        # Handle sending a new message
        content = request.POST.get('content')
        if content:
            # Create and save a new message in the database
            Message.objects.create(user=request.user, room=room, content=content)
            return redirect('live_chat', room_name=room_name)
    
    return render(request, 'livechat/chat_room.html', {'room': room, 'messages': messages})
