
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, StoreRequest, Store, Product, Order, OrderItem, Cart, CartItem, Rating

class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['age', 'phone', 'id_number', 'is_seller', 'store_request', 'profile_image']

    def get_profile_image(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        profile_image_url = obj.profile_image.url if obj.profile_image else None
        return request.build_absolute_uri(profile_image_url) if profile_image_url else None

    def get_is_admin(self, obj):
        return obj.user.is_superuser
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile', 'order_count']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile')
        profile = instance.profile

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        if 'password' in validated_data:
            instance.set_password(validated_data['password'])

        instance.save()

        profile.age = profile_data.get('age', profile.age)
        profile.phone = profile_data.get('phone', profile.phone)
        profile.id_number = profile_data.get('id_number', profile.id_number)
        profile.is_seller = profile_data.get('is_seller', profile.is_seller)
        profile.store_request = profile_data.get('store_request', profile.store_request)
        profile.save()

        return instance

class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_image']

class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'value', 'comment', 'created_at']

class StoreRequestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = StoreRequest
        fields = ['id', 'user', 'store_name', 'description', 'address', 'phone', 'store_type', 'status']
        read_only_fields = ['status', 'user']
        
class StoreSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    average_rating = serializers.ReadOnlyField()
    products = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'user', 'name', 'cover_image', 'is_approved', 'address', 'phone', 'store_type', 'average_rating', 'products']
        read_only_fields = ['is_approved', 'user', 'average_rating', 'products']

class ProductSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'store', 'name', 'description', 'price', 'image', 'is_approved', 'quantity', 'order_count']
        read_only_fields = ['is_approved', 'order_count']

  
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name')
    product_image = serializers.SerializerMethodField()
    store_name = serializers.CharField(source='product.store.name')

    class Meta:
        model = OrderItem
        fields = ['product_name', 'product_image', 'store_name', 'quantity', 'price', 'total_price']

    def get_product_image(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        product_image_url = obj.product.image.url if obj.product.image else None
        return request.build_absolute_uri(product_image_url) if product_image_url else None
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = UserSerializer()  # تأكد من تضمين الحقل user هنا
    store = StoreSerializer()

    class Meta:
        model = Order
        fields = ['id', 'user', 'store', 'total_amount', 'delivery_fee', 'total_with_delivery', 'payment_method', 'address', 'phone_number', 'visa_number', 'created_at', 'is_store_approved', 'is_admin_approved', 'items']

    def validate_visa_number(self, value):
        if self.initial_data['payment_method'] == 'visa' and not value:
            raise serializers.ValidationError("Visa number is required for Visa payment method.")
        return value
    
