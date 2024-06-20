from django.contrib import admin
from django.urls import path
from api.views import (
    UserProfileView, ProductListView, SignupView, UpdateProfileImageView, LogoutView, LoginView, StoreListView, CreateOrderView,
    ApproveOrderView, StoreRequestCreateView, StoreRequestDetailView, ApproveStoreRequestView, CreateRatingView, UserOrdersView, OrderDetailView, ProductDetailView, SearchView, AdminStatsView, UserListView, TestAuthView, StoreDetailView, UpdateProfileView, CartView, CheckoutView, ApproveStoreView, RatingView, TopRatedStoresView, MostOrderedProductsView,
    UserStoreView, CreateProductView,AdminStoreRequestsView , AdminOrdersView ,AdminCreateOrderView ,SellerOrdersView, StoreCreateView , AdminCreateProductView , StoreDeleteView ,RatingDeleteView ,ProductUpdateView, StoreRequestStatusView ,UserStoreDetailView , StoreUpdateView ,UpdateProductView, DeleteProductView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from django.urls import include
from api.views import  RecentOrdersView, RecentUsersView, UserDetailView, RecentStoreRequestsView ,SalesReportView,UserActivityReportView,TopRatedStoresReportView,MostOrderedProductsReportView,StoreRequestsReportListView,ApproveStoreRequestReportView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('api/stores/', StoreListView.as_view(), name='store-list'),
    path('api/stores/approve/<int:store_id>/', ApproveStoreView.as_view(), name='approve-store'),
    path('api/stores/top-rated/', TopRatedStoresView.as_view(), name='top-rated-stores'),
    path('api/stores/create/', StoreCreateView.as_view(), name='store-create'),

    path('api/store-request/', StoreRequestCreateView.as_view(), name='store-request-create'),
    path('api/store-request/<int:pk>/', StoreRequestDetailView.as_view(), name='store-request-detail'),
    path('api/store-request/status/<int:user_id>/', StoreRequestStatusView.as_view(), name='store-request-status'),
    path('api/approve-store-request/<int:request_id>/', ApproveStoreRequestView.as_view(), name='approve-store-request'),
    path('api/admin/store-requests/', AdminStoreRequestsView.as_view(), name='admin-store-requests'),

    path('stores/user/', UserStoreDetailView.as_view(), name='user-store-detail'),
    path('api/stores/update/<int:pk>/', StoreUpdateView.as_view(), name='store-update'),
    path('api/orders/', CreateOrderView.as_view(), name='create-order'),
    path('api/orders/approve/<int:order_id>/', ApproveOrderView.as_view(), name='approve-order'),
    path('api/orders/seller/', SellerOrdersView.as_view(), name='seller-orders'),
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/adminorders/', AdminOrdersView.as_view(), name='admin-orders'),  # تحديث هذا المسار

    path('api/orders/user/', UserOrdersView.as_view(), name='user-orders'),
    path('api/orders/detail/<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('api/orders/admin-create/', AdminCreateOrderView.as_view(), name='admin-create-order'),
    path('api/orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/profile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('api/update-profile-image/', UpdateProfileImageView.as_view(), name='update-profile-image'),

    path('api/products/', ProductListView.as_view(), name='product-list'),
    path('api/products/most-ordered/', MostOrderedProductsView.as_view(), name='most-ordered-products'),
    path('api/products/admin-create/', AdminCreateProductView.as_view(), name='admin-create-product'),

    path('api/ratings/', RatingView.as_view(), name='rating'),
    path('api/ratings/create/', CreateRatingView.as_view(), name='create-rating'),
    path('api/ratings/delete/<int:pk>/', RatingDeleteView.as_view(), name='delete-rating'),

    path('api/test-auth/', TestAuthView.as_view(), name='test_auth'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/update-profile/<str:username>/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/stores/delete/<int:pk>/', StoreDeleteView.as_view(), name='store-delete'),  # تعديل الـ URL pattern هنا

    path('api/stores/<int:id>/', StoreDetailView.as_view(), name='store-detail'),
    path('api/stores/user/', UserStoreView.as_view(), name='user-store'),
    path('api/products/create/', CreateProductView.as_view(), name='create-product'),
    path('api/products/update/<int:pk>/', UpdateProductView.as_view(), name='update-product'),
    path('api/products/delete/<int:pk>/', DeleteProductView.as_view(), name='delete-product'),
    path('api/dashboard-stats/', AdminStatsView.as_view(), name='dashboard-stats'),
    path('api/products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('api/search/', SearchView.as_view(), name='search'),

    path('api/orders/recent/', RecentOrdersView.as_view(), name='recent-orders'),
    path('api/users/recent/', RecentUsersView.as_view(), name='recent-users'),
    path('api/store-requests/recent/', RecentStoreRequestsView.as_view(), name='recent-store-requests'),

     path('api/reports/sales/', SalesReportView.as_view(), name='sales-report'),
    path('api/reports/user-activity/', UserActivityReportView.as_view(), name='user-activity-report'),
    path('api/reports/top-rated-stores/', TopRatedStoresReportView.as_view(), name='top-rated-stores-report'),
    path('api/reports/most-ordered-products/', MostOrderedProductsReportView.as_view(), name='most-ordered-products-report'),
    path('api/admin/store-requests/', StoreRequestsReportListView.as_view(), name='store-requests'),
    path('api/approve-store-request/<int:request_id>/', ApproveStoreRequestReportView.as_view(), name='approve-store-request'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
