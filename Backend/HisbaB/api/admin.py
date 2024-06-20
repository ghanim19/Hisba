from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, StoreRequest, Store, Product, Transaction, Order, OrderItem, Cart, CartItem, Rating

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profiles'

class OrderInline(admin.TabularInline):
    model = Order
    extra = 0
    readonly_fields = ('store', 'total_amount', 'delivery_fee', 'total_with_delivery', 'is_store_approved', 'is_admin_approved', 'created_at')
    can_delete = False
    verbose_name_plural = 'orders'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('product', 'quantity')
    can_delete = False
    verbose_name_plural = 'cart items'

class CartInline(admin.StackedInline):
    model = Cart
    can_delete = False
    verbose_name_plural = 'cart'
    inlines = [CartItemInline]

class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    readonly_fields = ('name', 'description', 'price', 'quantity', 'is_approved')
    can_delete = False
    verbose_name_plural = 'products'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline, OrderInline, CartInline)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'address', 'phone', 'store_type', 'is_approved']
    list_filter = ['is_approved', 'store_type']
    search_fields = ['name', 'user__username']

    
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'description', 'price', 'quantity', 'is_approved']
    list_filter = ['is_approved', 'store__name']
    search_fields = ['name', 'store__name']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'timestamp', 'is_successful']
    list_filter = ['is_successful', 'timestamp']
    search_fields = ['user__username']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'store', 'total_amount', 'delivery_fee', 'total_with_delivery', 'is_store_approved', 'is_admin_approved', 'created_at']
    list_filter = ['is_store_approved', 'is_admin_approved', 'created_at']
    search_fields = ['user__username', 'store__name']
    actions = ['approve_orders']

    def approve_orders(self, request, queryset):
        queryset.update(is_admin_approved=True)
    approve_orders.short_description = "Approve selected orders"

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'store', 'value', 'weight', 'created_at']
    list_filter = ['created_at', 'store__name']
    search_fields = ['user__username', 'store__name']

@admin.register(StoreRequest)
class StoreRequestAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'user', 'status', 'address', 'phone', 'store_type']
    list_filter = ['status', 'store_type']
    search_fields = ['store_name', 'user__username']
    actions = ['approve_store_requests']

    def approve_store_requests(self, request, queryset):
        for store_request in queryset:
            if store_request.status == 'Pending':
                if not Store.objects.filter(user=store_request.user).exists():
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
                else:
                    store_request.status = 'Duplicate'
                    store_request.save()
        self.message_user(request, "Selected store requests have been approved and stores created.")
    approve_store_requests.short_description = "Approve selected store requests"


