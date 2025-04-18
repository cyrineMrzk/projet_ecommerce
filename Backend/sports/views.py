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
from .models import *

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
            images=image_path,
            stock_quantity=int(data.get("stock_quantity", 1)),  # Default to 1 if not provided
            is_available=data.get("is_available", "true").lower() == "true"  # Convert string to boolean
        )

        product.save()

        return JsonResponse({"message": "Product created successfully", "product_id": product.id}, status=201)

    return JsonResponse({"error": "Invalid data"}, status=400)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def debug(request):
#     try:
#         # Get the specified user by email
#         from django.contrib.auth.models import User  # Or your custom user model
#         try:
#             user = User.objects.get(email="mohamedben@gmail.com")
#         except User.DoesNotExist:
#             return JsonResponse({"error": "User with email mohamedben@gmail.com not found"}, status=404)
        
#         # List of products to add
#         products_data = [
#             {
#                 "name": "Dumbbell Set",
#                 "category": "Gym Equipment",
#                 "price": 4500.00,
#                 "description": "A high-quality dumbbell set for your home gym.",
#                 "brand": "FitPro",
#                 "sex": "unisex",
#                 "sale_type": "SellNow",
#                 "colors": ["Black", "Silver"],
#                 "sizes": ["Standard"],
#                 "stock_quantity": 10,
#                 "is_available": True,
#                 "image": "dumbell.jpg"
#             },
#             {
#                 "name": "Bench Press",
#                 "category": "Gym Equipment",
#                 "price": 12000.00,
#                 "description": "Durable bench press for strength training.",
#                 "brand": "IronMax",
#                 "sex": "unisex",
#                 "sale_type": "SellNow",
#                 "colors": ["Black", "Silver"],
#                 "sizes": ["Standard"],
#                 "stock_quantity": 5,
#                 "is_available": True,
#                 "image": "benchpress.jpg"
#             },
#             {
#                 "name": "Treadmill",
#                 "category": "Cardio & Endurance",
#                 "price": 35000.00,
#                 "description": "High-performance treadmill for cardio workouts.",
#                 "brand": "RunTech",
#                 "sex": "unisex",
#                 "sale_type": "SellNow",
#                 "colors": ["Black", "Silver"],
#                 "sizes": ["Standard"],
#                 "stock_quantity": 3,
#                 "is_available": True,
#                 "image": "treadmill.jpg"
#             },
#             {
#                 "name": "Kettlebell 16kg",
#                 "category": "Gym Equipment",
#                 "price": 7000.00,
#                 "description": "16kg kettlebell for strength and conditioning.",
#                 "brand": "PowerLift",
#                 "sex": "unisex",
#                 "sale_type": "SellNow",
#                 "colors": ["Black", "Silver"],
#                 "sizes": ["Standard"],
#                 "stock_quantity": 15,
#                 "is_available": True,
#                 "image": "kettlebell.jpg"
#             }
#         ]

#         # Loop through each product and create it
#         for product_data in products_data:
#             # Instead of trying to save a file, just store the image filename
#             image_path = f"product_images/{product_data['image']}"
            
#             # Create product in the database with specified owner
#             product = Product.objects.create(
#                 owner=user,  # Set the owner to the specified user
#                 name=product_data["name"],
#                 brand=product_data["brand"],
#                 sex=product_data["sex"],
#                 colors=product_data["colors"],
#                 sizes=product_data["sizes"],
#                 price=product_data["price"],
#                 description=product_data["description"],
#                 category=product_data["category"],
#                 sale_type=product_data["sale_type"],
#                 images=image_path,  # Just store the path, don't try to save an actual file
#                 stock_quantity=product_data["stock_quantity"],
#                 is_available=product_data["is_available"]
#             )

#             product.save()  # Save the product to the database

#         return JsonResponse({"message": "Products added successfully!"}, status=201)

#     except Exception as e:
#         import traceback
#         print(traceback.format_exc())  # For debugging
#         return JsonResponse({"error": str(e)}, status=500)
    

def best_sellers(request):
    # Fetch the best-selling products (this method should be implemented in your Product model)
    best_selling_products = Product.get_best_sellers()

    # Limit the results to 10 products (take the first 4)
    best_selling_products = best_selling_products[:4]

    if not best_selling_products:
        return JsonResponse({"message": "No best sellers found."}, status=404)

    # Map the products to a list of dictionaries to send as JSON
    products_data = [
        {
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': str(product.price),  # Convert price to string to send in JSON
            'description': product.description,
            'brand': product.brand,
            'sex': product.sex,
            'image': getattr(product.images, 'url', None),  # Clean way to get the URL or None
        }
        for product in best_selling_products
    ]
    
    return JsonResponse(products_data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug(request):
    """
    Debug function to inspect and output data for best sellers.
    """
    try:
        # Fetch the best-selling products (this method should be implemented in your Product model)
        best_selling_products = Product.get_best_sellers()

        # Print the fetched products for debugging
        print(f"Fetched best-selling products: {best_selling_products}")

        # Limit the results to 10 products (take the first 4)
        best_selling_products = best_selling_products[:4]

        if not best_selling_products:
            print("No best sellers found.")
            return JsonResponse({"message": "No best sellers found."}, status=404)

        # Map the products to a list of dictionaries to send as JSON
        products_data = [
            {
                'id': product.id,
                'name': product.name,
                'category': product.category,
                'price': str(product.price),  # Convert price to string to send in JSON
                'description': product.description,
                'brand': product.brand,
                'sex': product.sex,
                'image': getattr(product.images, 'url', None),  # Clean way to get the URL or None
            }
            for product in best_selling_products
        ]

        # Print the data that will be sent to the client
        print(f"Products data to send: {products_data}")

        return JsonResponse(products_data, safe=False)

    except Exception as e:
        # If there's an error, print the traceback for debugging
        print("Error occurred:", str(e))
        print(traceback.format_exc())  # Print the stack trace for detailed debugging
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
                "images": image_url,  # Use the URL string instead of the ImageField object
                "stock_quantity": product.stock_quantity,  # Include stock quantity
                "is_available": product.is_available  # Include availability status
            }
            products_data.append(product_data)
        
        return JsonResponse({
            "products": products_data
        }, status=200)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print the full traceback for debugging
        return JsonResponse({"error": str(e)}, status=500)   

#http://127.0.0.1:8000/api/debug/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Add a product to the authenticated user's cart.
    """
    try:
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        color = request.data.get('color')
        size = request.data.get('size')

        if not product_id:
            return JsonResponse({"error": "Product ID is required"}, status=400)

        if not color or not size:
            return JsonResponse({"error": "Color and size are required"}, status=400)

        # Fetch the product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({"error": "Product not found"}, status=404)

        # Check if the product is in stock
        if not product.is_available or product.stock_quantity < quantity:
            return JsonResponse({"error": "Insufficient stock"}, status=400)

        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=request.user)

        # Check if the product with the same color and size is already in the cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            color=color,
            size=size,
            defaults={'quantity': quantity}
        )

        if not created:
            # Update the quantity if the item already exists
            cart_item.quantity += quantity
            cart_item.save()

        # Deduct the stock quantity
        product.stock_quantity -= quantity
        product.save()

        return JsonResponse({"message": "Product added to cart successfully"}, status=200)

    except Exception as e:
        print(traceback.format_exc())  # For debugging
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_favorites(request):
    """
    Add a product to the authenticated user's favorites.
    """
    try:
        product_id = request.data.get('product_id')

        if not product_id:
            return JsonResponse({"error": "Product ID is required"}, status=400)

        # Fetch the product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({"error": "Product not found"}, status=404)

        # Check if the product is already in the user's favorites
        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)

        if not created:
            return JsonResponse({"message": "Product is already in favorites"}, status=200)

        return JsonResponse({"message": "Product added to favorites successfully"}, status=201)

    except Exception as e:
        print(traceback.format_exc())  # For debugging
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """
    Get the authenticated user's cart contents.
    """
    try:
        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Get all items in the cart
        cart_items = CartItem.objects.filter(cart=cart).select_related('product')
        
        # Format the response
        items_data = []
        for item in cart_items:
            image_url = None
            if hasattr(item.product, 'images') and item.product.images:
                try:
                    image_url = item.product.images.url
                except:
                    pass
            
            items_data.append({
                "id": item.id,
                "product_id": item.product.id,
                "name": item.product.name,
                "brand": item.product.brand,
                "price": float(item.product.price),
                "quantity": item.quantity,
                "color": item.color,
                "size": item.size,
                "subtotal": float(item.subtotal),
                "image": image_url
            })
        
        return JsonResponse({
            "cart_id": cart.id,
            "items": items_data,
            "total_amount": float(cart.total_amount),
            "item_count": cart.item_count
        }, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """
    Update the quantity of a cart item.
    """
    try:
        quantity = int(request.data.get('quantity', 1))
        
        # Get the cart item
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Cart item not found"}, status=404)
        
        # Calculate quantity difference for stock adjustment
        quantity_diff = quantity - cart_item.quantity
        
        # Check if there's enough stock if increasing quantity
        if quantity_diff > 0 and (cart_item.product.stock_quantity < quantity_diff):
            return JsonResponse({"error": "Insufficient stock"}, status=400)
        
        # Update the product stock
        cart_item.product.stock_quantity -= quantity_diff
        cart_item.product.save()
        
        # Update the cart item quantity
        cart_item.quantity = quantity
        cart_item.save()
        
        return JsonResponse({
            "message": "Cart item updated successfully",
            "cart_total": float(cart_item.cart.total_amount)
        }, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id=None):
    """
    Remove an item from the cart or clear the entire cart.
    """
    try:
        cart = Cart.objects.get(user=request.user)
        
        if item_id:
            # Remove specific item
            try:
                cart_item = CartItem.objects.get(id=item_id, cart=cart)
                
                # Return the quantity to product stock
                cart_item.product.stock_quantity += cart_item.quantity
                cart_item.product.save()
                
                cart_item.delete()
                
                return JsonResponse({
                    "message": "Item removed from cart",
                    "cart_total": float(cart.total_amount),
                    "item_count": cart.item_count
                }, status=200)
            except CartItem.DoesNotExist:
                return JsonResponse({"error": "Cart item not found"}, status=404)
        else:
            # Clear entire cart
            cart_items = CartItem.objects.filter(cart=cart)
            
            # Return all quantities to product stock
            for item in cart_items:
                item.product.stock_quantity += item.quantity
                item.product.save()
            
            cart_items.delete()
            
            return JsonResponse({
                "message": "Cart cleared successfully",
                "cart_total": 0,
                "item_count": 0
            }, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    """
    Get the authenticated user's favorite products.
    """
    try:
        favorites = Favorite.objects.filter(user=request.user).select_related('product')
        
        favorites_data = []
        for favorite in favorites:
            image_url = None
            if hasattr(favorite.product, 'images') and favorite.product.images:
                try:
                    image_url = favorite.product.images.url
                except:
                    pass
            
            favorites_data.append({
                "id": favorite.id,
                "product_id": favorite.product.id,
                "name": favorite.product.name,
                "brand": favorite.product.brand,
                "price": float(favorite.product.price),
                "image": image_url,
                "added_at": favorite.added_at.isoformat()
            })
        
        return JsonResponse({"favorites": favorites_data}, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_favorites(request, product_id):
    """
    Remove a product from the authenticated user's favorites.
    """
    try:
        try:
            favorite = Favorite.objects.get(user=request.user, product_id=product_id)
            favorite.delete()
            return JsonResponse({"message": "Product removed from favorites"}, status=200)
        except Favorite.DoesNotExist:
            return JsonResponse({"error": "Product not in favorites"}, status=404)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Process checkout from cart to create an order.
    """
    try:
        # Get shipping information
        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')
        
        if not shipping_address:
            return JsonResponse({"error": "Shipping address is required"}, status=400)
        
        if not phone_number:
            return JsonResponse({"error": "Phone number is required"}, status=400)
        
        # Get the user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return JsonResponse({"error": "Cart not found"}, status=404)
        
        # Check if cart has items
        cart_items = CartItem.objects.filter(cart=cart)
        if not cart_items.exists():
            return JsonResponse({"error": "Cart is empty"}, status=400)
        
        # Create the order
        order = Order.objects.create(
            user=request.user,
            total_amount=cart.total_amount,
            shipping_address=shipping_address,
            phone_number=phone_number,
            status='pending'
        )
        
        # Create order items from cart items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
                color=cart_item.color,
                size=cart_item.size
            )
        
        # Clear the cart after successful order creation
        cart_items.delete()
        
        return JsonResponse({
            "message": "Order created successfully",
            "order_id": order.id,
            "total_amount": float(order.total_amount)
        }, status=201)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """
    Get all orders for the authenticated user.
    """
    try:
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        
        orders_data = []
        for order in orders:
            # Get order items
            items = OrderItem.objects.filter(order=order).select_related('product')
            
            items_data = []
            for item in items:
                image_url = None
                if hasattr(item.product, 'images') and item.product.images:
                    try:
                        image_url = item.product.images.url
                    except:
                        pass
                
                items_data.append({
                    "id": item.id,
                    "product_id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.price),
                    "quantity": item.quantity,
                    "color": item.color,
                    "size": item.size,
                    "subtotal": float(item.subtotal),
                    "image": image_url
                })
            
            orders_data.append({
                "id": order.id,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "shipping_address": order.shipping_address,
                "phone_number": order.phone_number,
                "created_at": order.created_at.isoformat(),
                "items": items_data
            })
        
        return JsonResponse({"orders": orders_data}, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_details(request, order_id):
    """
    Get details of a specific order.
    """
    try:
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
        
        # Get order items
        items = OrderItem.objects.filter(order=order).select_related('product')
        
        items_data = []
        for item in items:
            image_url = None
            if hasattr(item.product, 'images') and item.product.images:
                try:
                    image_url = item.product.images.url
                except:
                    pass
            
            items_data.append({
                "id": item.id,
                "product_id": item.product.id,
                "name": item.product.name,
                "price": float(item.price),
                "quantity": item.quantity,
                "color": item.color,
                "size": item.size,
                "subtotal": float(item.subtotal),
                "image": image_url
            })
        
        order_data = {
            "id": order.id,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "shipping_address": order.shipping_address,
            "phone_number": order.phone_number,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "items": items_data
        }
        
        return JsonResponse({"order": order_data}, status=200)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_auction(request):
    """
    Create a new auction for a product.
    """
    try:
        product_id = request.data.get('product_id')
        start_price = float(request.data.get('start_price', 0))
        end_date = request.data.get('end_date')
        
        if not product_id:
            return JsonResponse({"error": "Product ID is required"}, status=400)
        
        if not start_price or start_price <= 0:
            return JsonResponse({"error": "Valid start price is required"}, status=400)
        
        if not end_date:
            return JsonResponse({"error": "End date is required"}, status=400)
        
        # Get the product
        try:
            product = Product.objects.get(id=product_id, owner=request.user)
        except Product.DoesNotExist:
            return JsonResponse({"error": "Product not found or you don't own it"}, status=404)
        
        # Check if product already has an auction
        if hasattr(product, 'auction'):
            return JsonResponse({"error": "Product already has an auction"}, status=400)
        
        # Update product sale type
        product.sale_type = 'Auction'
        product.save()
        
        # Create the auction
        from django.utils.dateparse import parse_datetime
        end_datetime = parse_datetime(end_date)
        
        auction = Auction.objects.create(
            product=product,
            start_price=start_price,
            current_price=start_price,
            end_date=end_datetime,
            status='active'
        )
        
        return JsonResponse({
            "message": "Auction created successfully",
            "auction_id": auction.id
        }, status=201)
    
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)
    

