from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.http import JsonResponse,HttpResponse
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

@csrf_exempt  # Disable CSRF for testing (use proper authentication in production)
def create_product(request):
    if request.method == "POST":
        if request.FILES.get("image") and request.POST.get("name"):
            image = request.FILES["image"]
            image_path = default_storage.save(f"product_images/{image.name}", image)  # Saves the image

            # Extract other data
            data = request.POST
            user = get_user_model().objects.get(id=1)  # Replace with actual user authentication

            product = Product.objects.create(
                name=data.get("name"),
                owner=user,
                brand=data.get("brand", ""),
                sex=data.get("sex", "unisex"),
                colors=json.loads(data.get("colors", "[]")),  # Expecting JSON string
                sizes=json.loads(data.get("sizes", "[]")),
                price=float(data.get("price", 0)),
                description=data.get("description", ""),
                category=data.get("category", "Accessories"),
                sale_type=data.get("sale_type", "SellNow"),
                images=image_path
            )

            product.save()

            return JsonResponse({"message": "Product created successfully", "product_id": product.id}, status=201)

        return JsonResponse({"error": "Invalid data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def debug(request):

    user = get_user_model().objects.first()  # Make sure you're using a valid user

    data = {
        'name': 'hiba',
        'owner': user,  # Ensure it's a valid user
        'brand': 'Nike',
        'sex': 'unisex',
        'colors': '["red"]',  # Make sure it’s a valid JSON string
        'sizes': '["S"]',
        'price': '100',
        'description': 'description',
        'category': 'Accessories',
        'sale_type': "SellNow",
    }

    product = Product.objects.create(
        name=data.get("name"),
        owner=data.get("owner"),
        brand=data.get("brand"),
        sex=data.get("sex", "unisex"),
        colors=json.loads(data.get("colors", "[]")),
        sizes=json.loads(data.get("sizes", "[]")),
        price=float(data.get("price", 0)),
        description=data.get("description", ""),
        category=data.get("category", "Accessories"),
        sale_type=data.get("sale_type", "SellNow"),
    )

    return HttpResponse("ok")