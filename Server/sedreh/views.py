from django.views.generic import TemplateView
from django.shortcuts import render, redirect

from ordering.models import Order
from register.forms import NewUserForm
from django.contrib.auth import login, authenticate
from django.contrib import messages  # import messages
from django.contrib.auth.forms import AuthenticationForm  # add this


class IndexPage(TemplateView):

    def get(self, request, **kwargs):
        orders = Order.objects.filter(user=request.user).all()

        return render(request, 'mapIndex.html', context={"username": request.user.username, "orders": orders})


def register_request(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return redirect("index")
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful.")
            return redirect("index")
        messages.error(request, "Unsuccessful registration. Invalid information.")
    form = NewUserForm
    return render(request=request, template_name="register/register.html", context={"register_form": form})


def login_request(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return redirect("index")
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, f"You are now logged in as {username}.")
                return redirect("index")
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    form = AuthenticationForm()
    return render(request=request, template_name="register/login.html", context={"login_form": form})
