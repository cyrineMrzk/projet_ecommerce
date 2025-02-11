from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages

def home(request):
    if request.method == 'POST':
        if 'login' in request.POST:
            email = request.POST.get('email')
            password = request.POST.get('password')
            user = authenticate(username=email, password=password)
            if user:
                login(request, user)
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid email or password')
                
        elif 'register' in request.POST:
            email = request.POST.get('registerEmail')
            password1 = request.POST.get('registerPassword')
            password2 = request.POST.get('confirmPassword')
            
            if password1 != password2:
                messages.error(request, 'Passwords do not match')
            elif User.objects.filter(email=email).exists():
                messages.error(request, 'Email already registered')
            else:
                try:
                    user = User.objects.create_user(
                        username=email, 
                        email=email, 
                        password=password1
                    )
                    login(request, user)
                    return redirect('dashboard')
                except Exception as e:
                    messages.error(request, 'Error creating account')
            
    return render(request, 'myapp/home.html')

@login_required
def dashboard(request):
    context = {
        'total_users': User.objects.count(),
        # Ajoutez d'autres statistiques selon vos besoins
    }
    return render(request, 'myapp/dashboard.html', context)