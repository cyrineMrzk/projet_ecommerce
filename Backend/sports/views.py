import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import *
from django.shortcuts import get_object_or_404
from django.utils import timezone

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
    images = request.FILES.getlist("images")  # Get all uploaded files named "images"
    
    if images and request.POST.get("name"):
        data = request.POST
        user = request.user
        
        # Create the product first
        product = Product.objects.create(
            name=data.get("name"),
            owner=user,
            brand=data.get("brand", ""),
            sex=data.get("sex", "unisex"),
            colors=json.loads(data.get("colors", "[]")),
            sizes=json.loads(data.get("sizes", "[]")),
            price=float(data.get("price", 0)),
            description=data.get("description", ""),
            category=data.get("category", "Accessories"),
            sale_type=data.get("sale_type", "SellNow"),
            stock_quantity=int(data.get("stock_quantity", 1)),
            is_available=data.get("is_available", "true").lower() == "true"
        )
         # If product is to be auctioned, create auction instance
        if product.sale_type == "Auction":
            try:
                starting_bid = float(data.get("starting_bid", 0))
                bid_increment = float(data.get("bid_increment", 5.00))
                end_date = datetime.fromisoformat(data.get("end_date"))  # should be ISO format
                Auction.objects.create(
                    product=product,
                    starting_bid=starting_bid,
                    current_bid=starting_bid,
                    bid_increment=bid_increment,
                    end_date=end_date
                )
            except Exception as e:
                product.delete()  # rollback
                return JsonResponse({"error": f"Auction creation failed: {str(e)}"}, status=400)

        # Now add the images
        for image in images:
            ProductImage.objects.create(
                product=product,
                image=image  # Django will handle saving the file
            )
            
        return JsonResponse({"message": "Product created successfully", "product_id": product.id}, status=201)
    
    return JsonResponse({"error": "Invalid data"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_(request):
    try:
        from django.contrib.auth.models import User
        from django.core.files.base import ContentFile
        import os
        
        try:
            user = User.objects.get(email="mohamedben@gmail.com")
        except User.DoesNotExist:
            return JsonResponse({"error": "User with email mohamedben@gmail.com not found"}, status=404)
        
        # Create the product
        product = Product.objects.create(
            owner=user,
            name="New Balance 530",
            brand="New Balance",
            sex="unisex",
            colors=["gray", "white"],
            sizes=[40, 41, 42],
            price=8999.99,
            description="Baskets emblématiques New Balance 574, confortables, stylées et parfaites pour un usage quotidien.",
            category="Shoes",
            sale_type="SellNow",
            stock_quantity=12,
            is_available=True
        )
        image_names = ["newbalance1.jpg", "newbalance2.jpg", "newbalance3.jpg"]
        
        for name in image_names:
            # In a real scenario, you'd have actual image files
            # This is just a placeholder for the debug function
            # You might want to copy existing files from your static directory
            ProductImage.objects.create(
                product=product,
                image=f"product_images/{name}"  # This is just for demonstration
            )
            
        return JsonResponse({"message": "Produit New Balance ajouté avec succès", "product_id": product.id}, status=201)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
@api_view(['GET'])
def best_sellers(request):
    best_selling_products = Product.get_best_sellers().filter(sale_type="SellNow")[:4]

    if not best_selling_products:
        return JsonResponse({"message": "No best sellers found."}, status=404)

    products_data = []

    for product in best_selling_products:
        product_images = product.images.all()
        image_urls = [
            request.build_absolute_uri(image.image.url) for image in product_images
        ] if product_images else []

        product_data = {
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': float(product.price),
            'description': product.description,
            'brand': product.brand,
            'sex': product.sex,
            'images': image_urls  # ✅ Match same as get_my_products
        }

        products_data.append(product_data)

    return JsonResponse({'products': products_data}, status=200)

@csrf_exempt
@api_view(['GET'])
def fetch_products_by_filtering(request):
    try:
        # Debug logging to help identify available data
        all_categories = list(Product.objects.values_list('category', flat=True).distinct())
        print(f"Available categories in database: {all_categories}")
        print(f"Total products in database: {Product.objects.count()}")
        
        # Base queryset
        products = Product.objects.all()
        
        # Get filter parameters
        category = request.GET.get('category')
        brand = request.GET.get('brand')
        gender = request.GET.get('gender')  # This is the parameter from frontend
        color = request.GET.get('color')
        size = request.GET.get('size')
        min_price = request.GET.get('min_price', 0)
        max_price = request.GET.get('max_price', 15000)
        
        # Apply category filter with flexibility
        if category:
            from django.db.models import Q
            # Format the category both ways for flexibility
            formatted_category = category.replace('-', ' ')
            print(f"Searching for category: '{category}' or '{formatted_category}'")
            
            # Use Q objects for more flexible querying with OR condition
            products = products.filter(
                Q(category__icontains=formatted_category) | 
                Q(category__icontains=category)
            )
        
        # Apply other filters
        if brand and brand != 'all':
            products = products.filter(brand__iexact=brand)
        
        # Fix gender filtering - use the 'gender' parameter to filter on 'sex' field
        if gender and gender != 'all':
            products = products.filter(sex__iexact=gender)
        
        if color and color != 'all':
            # Handle array field more carefully
            try:
                products = products.filter(colors__contains=[color])
            except:
                # Fallback to string contains if JSON filtering fails
                products = products.filter(colors__icontains=color)
        
        if size and size != 'all':
            # Handle different data types for sizes
            try:
                # If size is a number, convert it
                size_value = int(size) if size.isdigit() else size
                products = products.filter(sizes__contains=[size_value])
            except:
                # Fallback to string contains
                products = products.filter(sizes__icontains=size)
        
        # Apply price range filter
        try:
            min_price_value = float(min_price)
            max_price_value = float(max_price)
            products = products.filter(price__gte=min_price_value, price__lte=max_price_value)
        except ValueError:
            # Handle invalid price values
            pass
        
        # Log filtered results count
        print(f"Found {products.count()} products after filtering")
        
        # Prepare response data
        products_data = []
        for product in products:
            # Get product images
            product_images = product.images.all()
            image_urls = [
                request.build_absolute_uri(image.image.url) for image in product_images
            ] if product_images else []
            
            # Process colors and sizes
            # Handle both list and string formats
            if hasattr(product, 'colors'):
                if isinstance(product.colors, list):
                    colors = product.colors
                elif product.colors and isinstance(product.colors, str):
                    try:
                        # Try to parse as JSON
                        import json
                        colors = json.loads(product.colors)
                    except json.JSONDecodeError:
                        # Fallback to comma-separated string
                        colors = [c.strip() for c in product.colors.split(',') if c.strip()]
                else:
                    colors = []
            else:
                colors = []
            
            # Same handling for sizes
            if hasattr(product, 'sizes'):
                if isinstance(product.sizes, list):
                    sizes = product.sizes
                elif product.sizes and isinstance(product.sizes, str):
                    try:
                        import json
                        sizes = json.loads(product.sizes)
                    except json.JSONDecodeError:
                        sizes = [s.strip() for s in product.sizes.split(',') if s.strip()]
                else:
                    sizes = []
            else:
                sizes = []
            
            # Build product data dictionary
            product_data = {
                'id': product.id,
                'name': product.name,
                'category': product.category,
                'price': float(product.price),
                'description': product.description,
                'brand': product.brand,
                'gender': product.sex,  # Return as 'gender' for consistency
                'images': image_urls,
                'colors': colors,
                'sizes': sizes
            }
            products_data.append(product_data)
        
        return JsonResponse({'products': products_data}, status=200)
    
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def debug(request):
#     """
#     Debug function to inspect and output data for best sellers.
#     """
#     try:
#         # Fetch the best-selling products (this method should be implemented in your Product model)
#         best_selling_products = Product.get_best_sellers()

#         # Print the fetched products for debugging
#         print(f"Fetched best-selling products: {best_selling_products}")

#         # Limit the results to 10 products (take the first 4)
#         best_selling_products = best_selling_products[:4]

#         if not best_selling_products:
#             print("No best sellers found.")
#             return JsonResponse({"message": "No best sellers found."}, status=404)

#         # Map the products to a list of dictionaries to send as JSON
#         products_data = [
#             {
#                 'id': product.id,
#                 'name': product.name,
#                 'category': product.category,
#                 'price': str(product.price),  # Convert price to string to send in JSON
#                 'description': product.description,
#                 'brand': product.brand,
#                 'sex': product.sex,
#                 'image': getattr(product.images, 'url', None),  # Clean way to get the URL or None
#             }
#             for product in best_selling_products
#         ]

#         # Print the data that will be sent to the client
#         print(f"Products data to send: {products_data}")

#         return JsonResponse(products_data, safe=False)

#     except Exception as e:
#         # If there's an error, print the traceback for debugging
#         print("Error occurred:", str(e))
#         print(traceback.format_exc())  # Print the stack trace for detailed debugging
#         return JsonResponse({"error": str(e)}, status=500)
    

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
            # Get all images for this product using the related_name 'images'
            product_images = product.images.all()
            image_urls = [request.build_absolute_uri(image.image.url) for image in product_images] if product_images else []
            
            product_data = {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "sex": product.sex,
                "colors": product.colors,
                "sizes": product.sizes,
                "price": float(product.price),  # Convert Decimal to float for JSON serialization
                "description": product.description,
                "category": product.category,
                "sale_type": product.sale_type,
                "images": image_urls,  # List of image URLs
                "stock_quantity": product.stock_quantity,
                "is_available": product.is_available,
                "created_at": product.created_at,
                "sales_count": product.sales_count
            }
            products_data.append(product_data)
        
        return JsonResponse({
            "products": products_data
        }, status=200)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print the full traceback for debugging
        return JsonResponse({"error": str(e)}, status=500)
#to debug the functions we use : 
#http://127.0.0.1:8000/api/debug/


# Cart______________________________________________________________________________________________

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
            return JsonResponse({"error": "product already in cart"}, status=400)
        
        # Get or create the user's cart
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # Check if the product with the same color and size is already in the cart
        try:
            cart_item = CartItem.objects.get(
                cart=cart,
                product=product,
                color=color,
                size=size
            )
            # Product already exists in cart, just update the quantity
            cart_item.quantity += quantity
            cart_item.save()
            message = "Product quantity updated in cart"
        except CartItem.DoesNotExist:
            # Add new item to cart
            CartItem.objects.create(
                cart=cart,
                product=product,
                color=color,
                size=size,
                quantity=quantity
            )
            message = "Product added to cart successfully"
        
        # Deduct the stock quantity
        product.stock_quantity -= quantity
        product.save()
        
        return JsonResponse({"message": message}, status=200)
    
    except Exception as e:
        print(traceback.format_exc())  # For debugging
        return JsonResponse({"error": str(e)}, status=500)
# Cart Views (updated to match product views style)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """
    Get the authenticated user's cart with all items including product images.
    """
    try:
        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Get all items in the cart with related product data
        cart_items = CartItem.objects.filter(cart=cart).select_related('product')
        
        # Format the response with detailed product information
        items_data = []
        for item in cart_items:
            # Get all images for the product
            product_images = item.product.images.all()
            image_urls = [request.build_absolute_uri(image.image.url) for image in product_images] if product_images else []
            
            items_data.append({
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "brand": item.product.brand,
                    "price": float(item.product.price),
                    "images": image_urls,
                    "description": item.product.description,
                    "category": item.product.category,
                    "is_available": item.product.is_available
                },
                "quantity": item.quantity,
                "color": item.color,
                "size": item.size,
                "subtotal": float(item.subtotal)
            })
        
        return JsonResponse({
            "cart_id": cart.id,
            "items": items_data,
            "total_amount": float(cart.total_amount),
            "item_count": cart.item_count
        }, status=200)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to retrieve cart: " + str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """
    Update cart item quantity with proper stock management.
    """
    try:
        quantity = int(request.data.get('quantity', 1))
        
        if quantity <= 0:
            return JsonResponse({"error": "Quantity must be at least 1"}, status=400)
        
        # Get the cart item
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            product = cart_item.product
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Cart item not found"}, status=404)
        
        # Calculate quantity difference
        quantity_diff = quantity - cart_item.quantity
        
        # Check stock availability if increasing quantity
        if quantity_diff > 0:
            if product.stock_quantity < quantity_diff:
                return JsonResponse({
                    "error": f"Only {product.stock_quantity} items available in stock",
                    "max_available": product.stock_quantity + cart_item.quantity
                }, status=400)
        
        # Update stock
        product.stock_quantity -= quantity_diff
        product.save()
        
        # Update cart item
        cart_item.quantity = quantity
        cart_item.save()
        
        # Return updated cart info
        cart = cart_item.cart
        return JsonResponse({
            "message": "Cart updated successfully",
            "item_id": cart_item.id,
            "quantity": cart_item.quantity,
            "subtotal": float(cart_item.subtotal),
            "total_amount": float(cart.total_amount),
            "item_count": cart.item_count
        }, status=200)
    
    except ValueError:
        return JsonResponse({"error": "Invalid quantity value"}, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to update cart: " + str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """
    Remove an item from cart and restore product stock.
    """
    try:
        # Get the cart item
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            product = cart_item.product
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Cart item not found"}, status=404)
        
        # Restore product stock
        product.stock_quantity += cart_item.quantity
        product.save()
        
        # Get cart before deletion for response
        cart = cart_item.cart
        total_before = float(cart.total_amount)
        count_before = cart.item_count
        
        # Delete the item
        cart_item.delete()
        
        # Refresh cart data
        cart.refresh_from_db()
        
        return JsonResponse({
            "message": "Item removed from cart",
            "removed_item_id": item_id,
            "total_amount": float(cart.total_amount),
            "item_count": cart.item_count,
            "amount_removed": total_before - float(cart.total_amount),
            "count_removed": count_before - cart.item_count
        }, status=200)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to remove item: " + str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """
    Clear all items from the cart and restore all product stocks.
    """
    try:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        # Restore all product stocks
        for item in cart_items:
            item.product.stock_quantity += item.quantity
            item.product.save()
        
        # Record info before clearing
        item_count = cart_items.count()
        total_amount = float(cart.total_amount)
        
        # Clear the cart
        cart_items.delete()
        
        return JsonResponse({
            "message": "Cart cleared successfully",
            "items_removed": item_count,
            "amount_removed": total_amount,
            "total_amount": 0.0,
            "item_count": 0
        }, status=200)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to clear cart: " + str(e)}, status=500)
    
#Favourite______________________________________________________________________________________________    

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
def get_favorites(request):
    """
    Get the authenticated user's favorite products.
    """
    try:
        favorites = Favorite.objects.filter(user=request.user).select_related('product')
        
        favorites_data = []
        for favorite in favorites:
            # Ensure the product has images and handle missing images
            image_url = None
            if hasattr(favorite.product, 'images') and favorite.product.images.exists():
                image_url = favorite.product.images.first().image.url  # Get the first image URL
            
            # Fallback to a default image if no image exists
            if not image_url:
                image_url = '/placeholder-product.jpg'  # Path to a default image
            
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



#orders_____________________________________________________________________________________________


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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    Create a new order from either:
    1. The user's cart (cart_id provided)
    2. Direct purchase of a product (product_id, quantity, color, size provided)
    """
    try:
        # Get data from request
        cart_id = request.data.get('cart_id')
        product_id = request.data.get('product_id')
        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')
        
        if not shipping_address or not phone_number:
            return JsonResponse({"error": "Shipping address and phone number are required"}, status=400)
        
        # Initialize variables
        order_items = []
        total_amount = 0
        
        # Case 1: Order from cart
        if cart_id:
            try:
                cart = Cart.objects.get(id=cart_id, user=request.user)
                cart_items = CartItem.objects.filter(cart=cart)
                
                if not cart_items.exists():
                    return JsonResponse({"error": "Your cart is empty"}, status=400)
                
                # Calculate total amount
                total_amount = sum(item.subtotal for item in cart_items)
                
                # Prepare order items
                for item in cart_items:
                    order_items.append({
                        'product': item.product,
                        'quantity': item.quantity,
                        'price': item.product.price,
                        'color': item.color,
                        'size': item.size
                    })
                
            except Cart.DoesNotExist:
                return JsonResponse({"error": "Cart not found"}, status=404)
        
        # Case 2: Direct purchase
        elif product_id:
            quantity = int(request.data.get('quantity', 1))
            color = request.data.get('color')
            size = request.data.get('size')
            
            if not color or not size:
                return JsonResponse({"error": "Color and size are required for direct purchase"}, status=400)
            
            try:
                product = Product.objects.get(id=product_id)
                
                # Check if product is available and in stock
                if not product.is_available or product.stock_quantity < quantity:
                    return JsonResponse({"error": "Product is not available or not enough in stock"}, status=400)
                
                # Calculate total amount
                total_amount = product.price * quantity
                
                # Prepare order item
                order_items.append({
                    'product': product,
                    'quantity': quantity,
                    'price': product.price,
                    'color': color,
                    'size': size
                })
                
            except Product.DoesNotExist:
                return JsonResponse({"error": "Product not found"}, status=404)
        
        else:
            return JsonResponse({"error": "Either cart_id or product_id must be provided"}, status=400)
        
        # Create the order
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='pending',
            shipping_address=shipping_address,
            phone_number=phone_number
        )
        
        # Create order items
        for item_data in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                color=item_data['color'],
                size=item_data['size']
            )
            
            # Update product sales count and stock
            product = item_data['product']
            product.sales_count += item_data['quantity']
            product.stock_quantity -= item_data['quantity']
            product.save()
        
        # If order was from cart, clear the cart
        if cart_id:
            CartItem.objects.filter(cart__id=cart_id).delete()
        
        # Generate invoice
        invoice_url = request.build_absolute_uri(f'/api/orders/{order.id}/invoice/')
        
        return JsonResponse({
            "message": "Order created successfully",
            "order_id": order.id,
            "invoice_url": invoice_url
        }, status=201)
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

from django.shortcuts import render
from .models import Order, OrderItem

def generate_invoice_pdf(request, order_id):
    # Get the order and its items
    order = Order.objects.get(id=order_id)
    items = OrderItem.objects.filter(order=order)
    user = order.user
    total_amount = sum(item.price * item.quantity for item in items)

    # Context for the template
    context = {
        'order': order,
        'user': user,
        'items': items,
        'total_amount': total_amount,
        'company_name': 'Your Company',
        'company_address': 'Your Address',
        'company_phone': 'Your Phone',
        'company_email': 'company@example.com'
    }

    # Render the template
    return render(request, 'sports/invoice_template.html', context)

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
                product_images = item.product.images.all()
                if product_images.exists():
                    try:
                        image_url = product_images.first().image.url
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
        import traceback
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
            product_images = item.product.images.all()
            if product_images.exists():
                try:
                    image_url = product_images.first().image.url
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
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

# Auctions______________________________________________________________________________________________

@api_view(['GET'])
def get_active_auctions(request):
    """
    Get all active auctions with their details
    """
    try:
        active_auctions = Auction.objects.filter(
            status='active',
            end_date__gt=timezone.now()
        ).select_related('product')
        
        auction_data = []
        for auction in active_auctions:
            auction_data.append({
                'id': auction.id,
                'product_id': auction.product.id,
                'product_name': auction.product.name,
                'category': auction.product.category,
                'starting_bid': float(auction.starting_bid),
                'current_bid': float(auction.current_bid),
                'bid_increment': float(auction.bid_increment),
                'end_date': auction.end_date.isoformat(),
                'time_remaining': auction.time_remaining.total_seconds() if auction.time_remaining else None,
                'highest_bidder': auction.highest_bidder.username if auction.highest_bidder else None,
                'image_url': auction.product.images.first().image.url if auction.product.images.exists() else None
            })
        
        return JsonResponse({'auctions': auction_data}, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_auction_details(request, auction_id):
    """
    Get detailed information about a specific auction
    """
    try:
        auction = get_object_or_404(Auction, id=auction_id)
        
        # Get recent bids (last 10)
        bids = Bid.objects.filter(auction=auction).order_by('-created_at')[:10]
        bid_history = [{
            'user': bid.user.username,
            'amount': float(bid.amount),
            'time': bid.created_at.isoformat()
        } for bid in bids]
        
        # Get product images
        images = [img.image.url for img in auction.product.images.all()]
        
        response_data = {
            'id': auction.id,
            'product': {
                'id': auction.product.id,
                'name': auction.product.name,
                'description': auction.product.description,
                'category': auction.product.category,
                'images': images
            },
            'starting_bid': float(auction.starting_bid),
            'current_bid': float(auction.current_bid),
            'bid_increment': float(auction.bid_increment),
            'start_date': auction.start_date.isoformat(),
            'end_date': auction.end_date.isoformat(),
            'status': auction.status,
            'is_active': auction.is_active,
            'highest_bidder': auction.highest_bidder.username if auction.highest_bidder else None,
            'owner': auction.product.owner.username,
            'bid_history': bid_history
        }
        
        return JsonResponse(response_data, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid(request, auction_id):
    """
    Place a bid on an auction
    """
    try:
        auction = get_object_or_404(Auction, id=auction_id)
        data = json.loads(request.body)
        bid_amount = float(data.get('amount', 0))
        
        # Validate bid amount
        if bid_amount <= auction.current_bid:
            return JsonResponse(
                {'error': f'Bid must be higher than current bid of {auction.current_bid}'},
                status=400
            )
        
        # Check if auction is active
        if not auction.is_active:
            return JsonResponse({'error': 'This auction is no longer active'}, status=400)
        
        # Place the bid
        if auction.place_bid(request.user, bid_amount):
            return JsonResponse({
                'success': 'Bid placed successfully',
                'current_bid': float(auction.current_bid),
                'highest_bidder': auction.highest_bidder.username if auction.highest_bidder else None
            }, status=200)
        else:
            return JsonResponse({'error': 'Failed to place bid'}, status=400)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_auction(request):
    """
    Create a new auction for a product
    """
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        starting_bid = float(data.get('starting_bid', 0))
        bid_increment = float(data.get('bid_increment', 5))
        days_active = int(data.get('days_active', 7))
        
        # Get the product
        product = get_object_or_404(Product, id=product_id, owner=request.user)
        
        # Check if product is already in an auction
        if hasattr(product, 'auction'):
            return JsonResponse({'error': 'This product is already in an auction'}, status=400)
        
        # Set product to auction mode
        product.sale_type = 'Auction'
        product.save()
        
        # Create the auction with timezone-aware datetimes
        now = timezone.now()
        auction = Auction.objects.create(
            product=product,
            starting_bid=starting_bid,
            current_bid=starting_bid,
            bid_increment=bid_increment,
            start_date=now,  # Using timezone.now() ensures it's timezone-aware
            end_date=now + timezone.timedelta(days=days_active),
            status='active'
        )
        
        return JsonResponse({
            'success': 'Auction created successfully',
            'auction_id': auction.id,
            'end_date': auction.end_date.isoformat()
        }, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def debug(request):
    """
    Debug version of auction creation to inspect all input and processing.
    """
    debug_info = {
        "input_data": {},
        "validated_data": {},
        "product_check": None,
        "auction_created": False,
        "auction_details": {},
        "errors": []
    }

    try:
        # Parse and record raw JSON input
        data = json.loads(request.body)
        debug_info['input_data'] = data

        # Extract and log validated fields
        product_id = data.get('product_id')
        starting_bid = float(data.get('starting_bid', 0))
        bid_increment = float(data.get('bid_increment', 5))
        days_active = int(data.get('days_active', 7))

        debug_info['validated_data'] = {
            "product_id": product_id,
            "starting_bid": starting_bid,
            "bid_increment": bid_increment,
            "days_active": days_active
        }

        # Product ownership and existence check
        try:
            product = get_object_or_404(Product, id=product_id, owner=request.user)
            debug_info['product_check'] = {
                "product_exists": True,
                "product_id": product.id,
                "product_name": product.name
            }
        except Exception as e:
            debug_info['product_check'] = {"error": str(e)}
            raise

        # Check if already in auction
        if hasattr(product, 'auction'):
            return JsonResponse({
                "error": "This product is already in an auction",
                "debug_info": debug_info
            }, status=400)

        # Update product sale type
        product.sale_type = 'Auction'
        product.save()

        # Create auction
        auction = Auction.objects.create(
            product=product,
            starting_bid=starting_bid,
            current_bid=starting_bid,
            bid_increment=bid_increment,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=days_active),
            status='active'
        )
        debug_info['auction_created'] = True
        debug_info['auction_details'] = {
            "auction_id": auction.id,
            "start_date": auction.start_date.isoformat(),
            "end_date": auction.end_date.isoformat()
        }

        return JsonResponse({
            "success": "Auction created successfully",
            "debug_info": debug_info
        }, status=201)

    except json.JSONDecodeError as je:
        debug_info['errors'].append(str(je))
        return JsonResponse({
            "error": "Invalid JSON data",
            "debug_info": debug_info
        }, status=400)

    except Exception as e:
        debug_info['errors'].append(str(e))
        return JsonResponse({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "debug_info": debug_info
        }, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_auction(request, auction_id):
    """
    Close an auction (only accessible to auction owner)
    """
    try:
        auction = get_object_or_404(Auction, id=auction_id)
        
        # Verify owner
        if auction.product.owner != request.user:
            return JsonResponse({'error': 'Only the auction owner can close this auction'}, status=403)
        
        # Close the auction
        winner = auction.close_auction()
        
        response_data = {
            'success': 'Auction closed successfully',
            'status': auction.status,
            'final_bid': float(auction.current_bid)
        }
        
        if winner:
            response_data['winner'] = winner.username
        else:
            response_data['message'] = 'Auction closed with no winning bids'
        
        return JsonResponse(response_data, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_auctions(request):
    """
    Get all auctions for products owned by the current user
    """
    try:
        auctions = Auction.objects.filter(product__owner=request.user).order_by('-start_date')
        
        auction_data = []
        for auction in auctions:
            auction_data.append({
                'id': auction.id,
                'product_name': auction.product.name,
                'current_bid': float(auction.current_bid),
                'status': auction.status,
                'start_date': auction.start_date.isoformat(),
                'end_date': auction.end_date.isoformat(),
                'highest_bidder': auction.highest_bidder.username if auction.highest_bidder else None,
                'bid_count': auction.bids.count()
            })
        
        return JsonResponse({'auctions': auction_data}, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    