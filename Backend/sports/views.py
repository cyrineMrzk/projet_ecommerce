from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import json
from .models import Product
from django.contrib.auth import get_user_model

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully!",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    email = request.data.get('username')  # Using email as the username
    password = request.data.get('password')

    users = User.objects.filter(email=email, is_superuser=False)

    if not users.exists():
        return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    if users.count() > 1:
        return Response({"error": "Multiple accounts found with this email. Contact support."}, status=status.HTTP_400_BAD_REQUEST)

    user = users.first()
    authenticated_user = authenticate(username=user.username, password=password)  

    if authenticated_user is not None:
        return Response({
            "message": "Login successful!",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,  # ✅ Add this
                "last_name": user.last_name    # ✅ Add this
            }
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

def create_product(request):
    if request.method == 'POST':
        # Validate required fields
        name = request.POST.get('name')
        description = request.POST.get('description')
        category = request.POST.get('category')
        price = request.POST.get('price')
        sale_type = request.POST.get('sale_type')
        
        # Add validation
        if not all([name, description, category, price, sale_type]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        # Validate category against choices
        valid_categories = [
            'Gym Equipment', 
            'Cardio & Endurance', 
            'Supplements', 
            'Accessories'
        ]
        if category not in valid_categories:
            return JsonResponse({'error': 'Invalid category'}, status=400)
        
        # Validate sale type
        valid_sale_types = ['SellNow', 'Auction']
        if sale_type not in valid_sale_types:
            return JsonResponse({'error': 'Invalid sale type'}, status=400)
        
        # Get uploaded images
        images = request.FILES.getlist('images')
        if len(images) < 3:
            return JsonResponse({'error': 'At least 3 images are required'}, status=400)
        
        try:
            # Create the product
            product = Product.objects.create(
                name=name,
                description=description,
                category=category,
                price=price,
                sale_type=sale_type,
                owner=request.user,  # Assuming user authentication
                # Add other fields as needed
            )
            
            # Handle multiple image uploads
            for image in images:
                ProductImage.objects.create(
                    product=product,
                    image=image
                )
            
            return JsonResponse({
                'message': 'Product created successfully', 
                'product_id': product.id
            }, status=201)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)