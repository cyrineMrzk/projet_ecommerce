import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import json
from .models import Product

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create token for the user
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "message": "User created successfully!",
            "token": token.key,  # Return the token
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
        # Create or get token
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=authenticated_user)
        
        return Response({
            "message": "Login successful!",
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_product(request):
    if request.FILES.get("image") and request.POST.get("name"):
        image = request.FILES["image"]
        image_path = default_storage.save(f"product_images/{image.name}", image)  # Saves the image

        # Extract other data
        data = request.POST
        user = request.user  # Get the authenticated user

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug(request):
    """
    Debug endpoint to test GET products.
    """
    try:
        # Fetch all products
        products = Product.objects.all()
        
        # Convert products to a list of dictionaries
        products_data = []
        for product in products:
            # Convert ImageField to string URL
            image_url = None
            if hasattr(product, 'images') and product.images:
                try:
                    image_url = product.images.url  # Get the URL
                except:
                    # If there's an error getting the URL, use None
                    pass
            
            product_data = {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "sex": product.sex,
                "colors": product.colors,
                "sizes": product.sizes,
                "price": product.price,
                "description": product.description,
                "category": product.category,
                "sale_type": product.sale_type,
                "images": image_url  # Use the URL string instead of the ImageField object
            }
            products_data.append(product_data)
        
        return JsonResponse({
            "products": products_data
        }, status=200)
        
    except Exception as e:
        print(traceback.format_exc())  # Print the full traceback for debugging
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_products(request):
    """
    Get all products owned by the authenticated user.
    """
    try:
        # Get the authenticated user directly
        user = request.user
        
        # Get all products owned by the user
        products = Product.objects.filter(owner=user)
        
        # Convert products to a list of dictionaries
        products_data = []
        for product in products:
            # Convert ImageField to string URL
            image_url = None
            if hasattr(product, 'images') and product.images:
                try:
                    image_url = product.images.url  # Get the URL
                except:
                    # If there's an error getting the URL, use None
                    pass
            
            product_data = {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "sex": product.sex,
                "colors": product.colors,
                "sizes": product.sizes,
                "price": product.price,
                "description": product.description,
                "category": product.category,
                "sale_type": product.sale_type,
                "images": image_url  # Use the URL string instead of the ImageField object
            }
            products_data.append(product_data)
        
        return JsonResponse({
            "products": products_data
        }, status=200)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print the full traceback for debugging
        return JsonResponse({"error": str(e)}, status=500)    