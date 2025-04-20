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
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.conf import settings

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

@api_view(['GET'])
def debug(request):
    try:
        from django.db.models import Q

        # Capture all raw input
        query_params = dict(request.GET)

        debug_output = {
            "query_params": query_params,
            "matched_product_ids": [],
            "filtered_fields": {},
            "product_snapshots": []
        }

        queryset = Product.objects.all()

        category = request.GET.get('category')
        brand = request.GET.get('brand')
        gender = request.GET.get('gender')
        color = request.GET.get('color')
        size = request.GET.get('size')
        min_price = request.GET.get('min_price', 0)
        max_price = request.GET.get('max_price', 15000)

        if category:
            formatted_category = category.replace('-', ' ')
            debug_output['filtered_fields']['category'] = [category, formatted_category]
            queryset = queryset.filter(Q(category__icontains=category) | Q(category__icontains=formatted_category))

        if brand and brand != 'all':
            debug_output['filtered_fields']['brand'] = brand
            queryset = queryset.filter(brand__iexact=brand)

        if gender and gender != 'all':
            debug_output['filtered_fields']['gender'] = gender
            queryset = queryset.filter(sex__iexact=gender)

        if color and color != 'all':
            debug_output['filtered_fields']['color'] = color
            try:
                queryset = queryset.filter(colors__contains=[color])
            except:
                queryset = queryset.filter(colors__icontains=color)

        if size and size != 'all':
            debug_output['filtered_fields']['size'] = size
            try:
                size_val = int(size) if size.isdigit() else size
                queryset = queryset.filter(sizes__contains=[size_val])
            except:
                queryset = queryset.filter(sizes__icontains=size)

        try:
            min_price_val = float(min_price)
            max_price_val = float(max_price)
            debug_output['filtered_fields']['price_range'] = [min_price_val, max_price_val]
            queryset = queryset.filter(price__gte=min_price_val, price__lte=max_price_val)
        except ValueError as ve:
            debug_output['filtered_fields']['price_range'] = str(ve)

        debug_output['matched_product_ids'] = list(queryset.values_list('id', flat=True))

        for product in queryset[:10]:
            debug_output['product_snapshots'].append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'category': product.category,
                'gender(sex)': product.sex,
                'price': float(product.price),
                'colors': product.colors,
                'sizes': product.sizes
            })

        return JsonResponse(debug_output, status=200)

    except Exception as e:
        import traceback
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)


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
    

