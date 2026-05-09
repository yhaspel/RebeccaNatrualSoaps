from django.urls import path

from . import views

urlpatterns = [
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("confirm/", views.ConfirmView.as_view(), name="confirm"),
    path("grow-callback/", views.GrowCallbackView.as_view(), name="grow-callback"),
    path("mine/", views.MyOrdersView.as_view(), name="my-orders"),
    path("<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),
]
