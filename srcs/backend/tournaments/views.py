import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .forms import TournamentCreationForm
from .models import Tournament

@csrf_exempt
@require_POST
@login_required
def create_tournament(request):
    try:
        data = json.loads(request.body)

        form = TournamentCreationForm(data)
        if form.is_valid():
            tournament = form.save(user=request.user)

            return JsonResponse({
                'message': 'Tournament created',
                'tournament_id': tournament.id,
                'tournament_name': tournament.name
            }, status=201)
        return JsonResponse({'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'errors': 'Invalid JSON input.'}, status=400)
    except Exception as e:
        return JsonResponse({'errors': str(e)}, status=500)

@csrf_exempt
@require_POST
@login_required
def join_tournament(request, tournament_id):
    try:
        data = json.loads(request.body)

        tournament = Tournament.objects.get(id=tournament_id)
        display_name = data.get('display_name')

        try:
            tournament.add_player(request.user, display_name)
        except ValueError as e:
            return JsonResponse({'errors': str(e)}, status=400)

        return JsonResponse({
            'message': f'{display_name} joined tournament',
            'tournament_id': tournament.id,
            'tournament_name': tournament.name
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'errors': 'Invalid JSON input.'}, status=400)
    except Tournament.DoesNotExist:
        return JsonResponse({'errors': 'Tournament not found'}, status=404)
    except Exception as e:
        return JsonResponse({'errors': str(e)}, status=500)
