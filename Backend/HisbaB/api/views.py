from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Store, Product, OrderItem, Order, StoreRequest, UserProfile, Cart, CartItem, Rating
from .serializers import ProfileImageSerializer, StoreRequestSerializer, UserProfileSerializer, UserSerializer, StoreSerializer, ProductSerializer, OrderSerializer, CartSerializer, RatingSerializer
from rest_framework.generics import RetrieveAPIView
from django.contrib.auth import get_user_model
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Avg, Count
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.decorators import action


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


User = get_user_model()

class UserProfileView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        # أسمح للمستخدم بتحديث ملفه الشخصي فقط
        return self.request.user.profile

    def patch(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data, instance=self.object, partial=True)
        if serializer.is_valid():
            self.object = serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UpdateProfileImageView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileImageSerializer

    def get_object(self):
        return self.request.user.profile

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({**tokens, 'user_id': user.id, 'username': user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            tokens = get_tokens_for_user(user)
            profile = UserProfile.objects.get(user=user)
            if user.is_superuser:
                role = 'admin'
            elif profile.is_seller:
                role = 'seller'
            else:
                role = 'customer'
            return Response({
                'refresh': tokens['refresh'],
                'access': tokens['access'],
                'user_id': user.id,
                'username': user.username,
                'role': role
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class StoreListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

class StoreCreateView(generics.CreateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        user = User.objects.get(id=user_id)
        serializer.save(user=user)

class ProductListView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['store']

class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id):
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        store_id = request.data.get('store_id')
        items = request.data.get('items')
        delivery_fee = request.data.get('delivery_fee', 0.00)
        address = request.data.get('address')
        phone_number = request.data.get('phone_number')
        payment_method = request.data.get('payment_method')
        visa_number = request.data.get('visa_number', None)

        if not store_id or not items:
            return Response({'error': 'Missing store_id or items'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            order = Order.objects.create(
                user=user, store=store, total_amount=sum(item['quantity'] * item['price'] for item in items),
                delivery_fee=delivery_fee, address=address,
                phone_number=phone_number, payment_method=payment_method,
                visa_number=visa_number if payment_method == 'visa' else None
            )

            for item in items:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    OrderItem.objects.create(order=order, product=product, quantity=item['quantity'], price=item['price'])
                except Product.DoesNotExist:
                    return Response({'error': f"Product with id {item['product_id']} not found"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ApproveOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            if request.user == order.store.user or request.user.is_superuser:
                if request.user == order.store.user:
                    order.is_store_approved = True
                if request.user.is_superuser:
                    order.is_admin_approved = True

                order.save()
                return Response({'status': 'Order approved'}, status=status.HTTP_200_OK)
            return Response({'error': 'You are not authorized to approve this order'}, status=status.HTTP_403_FORBIDDEN)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class SellerOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(store__user=request.user)
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cart, created = Cart.objects.get_or_create(user=user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        cart, created = Cart.objects.get_or_create(user=user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product=product)
        if quantity > product.quantity:
            return Response({'error': 'Requested quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product=product)
        cart_item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

import logging
logger = logging.getLogger(__name__)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        address = request.data.get('address')
        phone_number = request.data.get('phone_number')
        payment_method = request.data.get('payment_method')
        visa_number = request.data.get('visa_number', None)
        expiry_date = request.data.get('expiry_date', None)
        cvc = request.data.get('cvc', None)

        if not address or not phone_number or not payment_method:
            return Response({'error': 'Address, phone number, and payment method are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if payment_method == 'visa' and (not visa_number or not expiry_date or not cvc):
            return Response({'error': 'Visa number, expiry date, and CVC are required for visa payment.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=user)
            if not cart.items.exists():
                return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

            total_price = sum(item.product.price * item.quantity for item in cart.items.all())
            delivery_fee = 5
            store = cart.items.first().product.store

            order = Order.objects.create(
                user=user, store=store, total_amount=total_price,
                delivery_fee=delivery_fee, total_with_delivery=total_price + delivery_fee,
                address=address, phone_number=phone_number, payment_method=payment_method,
                visa_number=visa_number if payment_method == 'visa' else None
            )

            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order, product=cart_item.product,
                    quantity=cart_item.quantity, price=cart_item.product.price
                )

            cart.items.all().delete()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({'error': 'One or more products not found.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Error during checkout: %s", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(user=user)
    
class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user=user)

class ApproveStoreView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, store_id):
        try:
            store = Store.objects.get(id=store_id)
            store.is_approved = True
            store.save()
            return Response({'status': 'Store approved'}, status=status.HTTP_200_OK)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

User = get_user_model()
class StoreRequestCreateView(generics.CreateAPIView):
    queryset = StoreRequest.objects.all()
    serializer_class = StoreRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if StoreRequest.objects.filter(user=user, status__in=['Pending', 'Approved']).exists():
            raise ValidationError('You already have a pending or approved store request')
        serializer.save(user=user)
class ApproveStoreRequestView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, request_id):
        try:
            store_request = StoreRequest.objects.get(id=request_id)
            # Check if the user already has a store
            if Store.objects.filter(user=store_request.user).exists():
                return Response({'error': 'User already has a store'}, status=status.HTTP_400_BAD_REQUEST)

            Store.objects.create(
                user=store_request.user,
                name=store_request.store_name,
                address=store_request.address,
                phone=store_request.phone,
                store_type=store_request.store_type,
                cover_image=None,
                is_approved=True
            )
            store_request.status = 'Approved'
            store_request.save()
            user_profile = store_request.user.profile
            user_profile.is_seller = True
            user_profile.save()
            return Response({'status': 'Store approved and user updated to seller'}, status=status.HTTP_200_OK)
        except StoreRequest.DoesNotExist:
            return Response({'error': 'Store request not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StoreRequestStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            store_request = StoreRequest.objects.get(user_id=user_id)
            return Response({'status': store_request.status}, status=status.HTTP_200_OK)
        except StoreRequest.DoesNotExist:
            return Response({'status': 'No request found'}, status=status.HTTP_404_NOT_FOUND)
class StoreRequestDetailView(generics.RetrieveAPIView):
    queryset = StoreRequest.objects.all()
    serializer_class = StoreRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    

class AdminStoreRequestsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        store_requests = StoreRequest.objects.all()
        serializer = StoreRequestSerializer(store_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class RatingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        store_id = request.query_params.get('store_id')
        if not store_id:
            return Response({'error': 'Store ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            store = Store.objects.get(id=store_id)
            ratings = Rating.objects.filter(store=store).select_related('user')
            data = RatingSerializer(ratings, many=True).data
            return Response(data)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        user = request.user
        store_id = request.data.get('store_id')
        value = request.data.get('value')
        comment = request.data.get('comment', '')
        weight = request.data.get('weight', 1.0)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

        rating = Rating.objects.create(user=user, store=store, value=value, weight=weight, comment=comment)
        return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)

class CreateRatingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        store_id = request.data.get('store_id')
        value = request.data.get('value')
        comment = request.data.get('comment', '')
        weight = request.data.get('weight', 1.0)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

        rating = Rating.objects.create(user=user, store=store, value=value, weight=weight, comment=comment)
        serializer = RatingSerializer(rating, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TopRatedStoresView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        top_rated_stores = Store.objects.annotate(average_rating=Avg('rating__value')).order_by('-average_rating')[:5]
        serializer = StoreSerializer(top_rated_stores, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class MostOrderedProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        most_ordered_products = Product.objects.annotate(order_count=Count('order_items')).order_by('-order_count')[:5]
        serializer = ProductSerializer(most_ordered_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Authenticated"})
    

class UserStoreDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = Store.objects.filter(user=request.user).first()
        if not store:
            return Response({"error": "Store not found"}, status=404)
        serializer = StoreSerializer(store)
        return Response(serializer.data)
    
class StoreDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'id'

class StoreDeleteView(generics.DestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAdminUser] 
    lookup_field = 'pk' 
class StoreUpdateView(generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"error": "You do not have permission to edit this store."}, status=403)
        return super().patch(request, *args, **kwargs)
class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
class UserStoreView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StoreSerializer

    def get_object(self):
        return self.request.user.store

class StoreUpdateView(generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

class CreateProductView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(store=self.request.user.store)


class AdminCreateProductView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        store_id = self.request.data.get('store_id')
        if not store_id:
            return Response({"error": "Store ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer.save(store=store)
class UpdateProductView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(store=self.request.user.store)

class DeleteProductView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(store=self.request.user.store)
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Product, Order
from django.db.models import Sum

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users_count = User.objects.count()
        products_count = Product.objects.count()
        orders_count = Order.objects.count()
        total_sales = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        return Response({
            "users_count": users_count,
            "products_count": products_count,
            "orders_count": orders_count,
            "total_sales": total_sales
        })

class RecentOrdersView(generics.ListAPIView):
    queryset = Order.objects.order_by('-created_at')[:5]
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class RecentUsersView(generics.ListAPIView):
    queryset = User.objects.annotate(order_count=Count('orders')).order_by('-date_joined')[:5]
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class RecentStoreRequestsView(generics.ListAPIView):
    queryset = StoreRequest.objects.order_by('-created_at')[:5]
    serializer_class = StoreRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
from django.db.models import Q

class SearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if query:
            products = Product.objects.filter(name__icontains=query)
            stores = Store.objects.filter(name__icontains=query)
            
            results = [
                {'name': product.name, 'url': f'/products/{product.id}', 'type': 'product'} for product in products
            ] + [
                {'name': store.name, 'url': f'/store/{store.id}', 'type': 'store'} for store in stores
            ]

            return Response({'results': results, 'count': len(results)}, status=status.HTTP_200_OK)
        return Response({'results': [], 'count': 0}, status=status.HTTP_200_OK)



class RatingDeleteView(generics.DestroyAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAdminUser]


class AdminCreateOrderView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        store_id = self.request.data.get('store_id')
        if not user_id or not store_id:
            raise ValidationError({"error": "User ID and Store ID are required."})

        try:
            user = User.objects.get(id=user_id)
            store = Store.objects.get(id=store_id)
        except (User.DoesNotExist, Store.DoesNotExist):
            raise ValidationError({"error": "User or Store not found."})

        serializer.save(user=user, store=store)
class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user=user)
    


class AdminOrdersView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]



class SalesReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sales = Order.objects.values('store__name').annotate(total_sales=Sum('total_amount')).order_by('-total_sales')
        return Response(sales, status=status.HTTP_200_OK)

class UserActivityReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        user_activity = User.objects.annotate(order_count=Count('orders')).order_by('-order_count')
        return Response(UserSerializer(user_activity, many=True, context={'request': request}).data, status=status.HTTP_200_OK)

class TopRatedStoresReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        top_rated_stores = Store.objects.filter(is_approved=True).annotate(rating=Avg('ratings__value')).order_by('-rating')
        return Response(StoreSerializer(top_rated_stores, many=True, context={'request': request}).data, status=status.HTTP_200_OK)

class MostOrderedProductsReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        most_ordered_products = Product.objects.annotate(order_count=Count('order_items')).order_by('-order_count')
        serialized_products = ProductSerializer(most_ordered_products, many=True, context={'request': request})
        return Response(serialized_products.data, status=200)
class StoreRequestsReportListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        store_requests = StoreRequest.objects.all()
        return Response(StoreRequestSerializer(store_requests, many=True, context={'request': request}).data, status=status.HTTP_200_OK)

class ApproveStoreRequestReportView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, request_id):
        try:
            store_request = StoreRequest.objects.get(id=request_id)
            if Store.objects.filter(user=store_request.user).exists():
                return Response({'error': 'User already has a store'}, status=status.HTTP_400_BAD_REQUEST)

            Store.objects.create(
                user=store_request.user,
                name=store_request.store_name,
                address=store_request.address,
                phone=store_request.phone,
                store_type=store_request.store_type,
                cover_image=None,
                is_approved=True
            )
            store_request.status = 'Approved'
            store_request.save()
            user_profile = store_request.user.profile
            user_profile.is_seller = True
            user_profile.save()
            return Response({'status': 'Store approved and user updated to seller'}, status=status.HTTP_200_OK)
        except StoreRequest.DoesNotExist:
            return Response({'error': 'Store request not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
