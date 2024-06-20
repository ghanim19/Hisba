from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from datetime import datetime

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    id_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    is_seller = models.BooleanField(default=False)
    store_request = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    def __str__(self):
        return self.user.username

User = get_user_model()

class Store(models.Model):
    user = models.OneToOneField(User, related_name='store', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    store_type = models.CharField(max_length=100, choices=[('Farm', 'Farm'), ('Manufacturing', 'Manufacturing')], null=True, blank=True)
    cover_image = models.ImageField(upload_to='store_covers/', null=True, blank=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if not ratings.exists():
            return 0
        total_weighted_sum = sum(rating.weight * rating.value for rating in ratings)
        total_weight = sum(rating.weight for rating in ratings)
        return total_weighted_sum / total_weight if total_weight > 0 else 0

User = get_user_model()

class StoreRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    store_name = models.CharField(max_length=100)
    description = models.TextField()
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    store_type = models.CharField(max_length=100, choices=[('Farm', 'Farm'), ('Manufacturing', 'Manufacturing')], null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(default=datetime.now) 
    def __str__(self):
        return self.store_name

class Product(models.Model):
    store = models.ForeignKey(Store, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} (x{self.quantity})"
class Order(models.Model):
    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    store = models.ForeignKey(Store, related_name='orders', on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    total_with_delivery = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_store_approved = models.BooleanField(default=False)
    is_admin_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields for payment options and contact info
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('visa', 'Visa'),
    ]
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cash')
    address = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=20 ,  null=True, blank=True)
    visa_number = models.CharField(max_length=16, blank=True, null=True)  # Optional based on payment method
    cvc = models.CharField(max_length=16, blank=True, null=True)  # Optional based on payment method
    expiry_date  = models.CharField(max_length=16, blank=True, null=True)  # Optional based on payment method

    def __str__(self):
        return f"Order {self.id} from {self.user.username} - {'Store Approved' if self.is_store_approved else 'Pending'}"
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.total_price = self.price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"

class Transaction(models.Model):
    user = models.ForeignKey(User, related_name='transactions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_successful = models.BooleanField(default=False)

    def __str__(self):
        return f"Transaction for {self.user.username} - {'Successful' if self.is_successful else 'Failed'}"



class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, related_name='ratings', on_delete=models.CASCADE)
    value = models.IntegerField()
    weight = models.FloatField(default=1.0)
    comment = models.TextField(null=True, blank=True)  # حقل جديد للتعليقات
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.store.name} - {self.value}"
    

