import datetime
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from main.forms import ProductForm
from main.models import Product

# Create your views here.
def register(request):
    form = UserCreationForm()

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        
        # Check if AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if form.is_valid():
                form.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Account created successfully!',
                    'redirect': reverse('main:login')
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Registration failed. Please check your input.',
                    'errors': form.errors
                })
        
        # Regular form submission
        if form.is_valid():
            form.save()
            messages.success(request, "Akun Anda berhasil dibuat!")
            return redirect('main:login')
    
    context = {
        'form': form
    }
    return render(request, 'register.html', context)

def login_user(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)

        # Check if AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if form.is_valid():
                user = form.get_user()
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'message': f'Welcome back, {user.username}!',
                    'redirect': reverse('main:show_main')
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid username or password.',
                    'errors': form.errors
                })

        # Regular form submission
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            response = HttpResponseRedirect(reverse("main:show_main"))
            response.set_cookie('last_login', str(datetime.datetime.now()))
            return response
    else:
        form = AuthenticationForm(request)

    context = {
        'form': form
    }

    return render(request, 'login.html', context)

def logout_user(request):
    logout(request)
    response = HttpResponseRedirect(reverse('main:login'))
    response.delete_cookie('last_login')
    return response

@login_required(login_url='/login')
def show_main(request):
    filter_type = request.GET.get('filter', 'all')

    if filter_type == "all":
        product_list = Product.objects.all()
    else:
        product_list = Product.objects.filter(user=request.user)

    context = {
        'npm' : '2406432103',
        'name': request.user.username,
        'class': 'PBP C',
        'product_list': product_list,
        'last_login': request.COOKIES.get('last_login', 'Never')
    }

    return render(request, "main.html", context)

@login_required(login_url='/login')
def create_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST or None)
        
        # Check if AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if form.is_valid():
                product = form.save(commit=False)
                product.user = request.user
                product.save()
                return JsonResponse({
                    'success': True,
                    'message': f'{product.name} has been added successfully!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Failed to add product. Please check your input.',
                    'errors': form.errors
                })
        
        # Regular form submission
        if form.is_valid():
            product = form.save(commit=False)
            product.user = request.user
            product.save()
            return redirect('main:show_main')

    form = ProductForm()
    context = {
        'form': form
    }

    return render(request, "create_product.html", context)

@login_required(login_url='/login')
def show_product(request, id):
    product = get_object_or_404(Product, pk=id)

    context = {
        'product': product
    }

    return render(request, "show_product.html", context)

@login_required
def edit_product(request, id):
    product = get_object_or_404(Product, pk=id)
    
    if request.method == 'POST':
        form = ProductForm(request.POST or None, instance=product)
        
        # Check if AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if form.is_valid():
                form.save()
                return JsonResponse({
                    'success': True,
                    'message': f'{product.name} has been updated successfully!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Failed to update product. Please check your input.',
                    'errors': form.errors
                })
        
        # Regular form submission
        if form.is_valid():
            form.save()
            return redirect('main:show_main')

    form = ProductForm(instance=product)
    context = {
        'form': form
    }

    return render(request, "edit_product.html", context)

@login_required
@require_POST
def delete_product(request, id):
    product = get_object_or_404(Product, pk=id)
    product_name = product.name
    
    # Check if AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        product.delete()
        return JsonResponse({
            'success': True,
            'message': f'{product_name} has been deleted successfully!'
        })
    
    # Regular deletion
    product.delete()
    return HttpResponseRedirect(reverse('main:show_main'))

@login_required(login_url='/login')
def show_xml(request):
    filter_type = request.GET.get('filter', 'all')
    
    if filter_type == "all":
        product_list = Product.objects.all()
    else:
        product_list = Product.objects.filter(user=request.user)
    
    xml_data = serializers.serialize("xml", product_list)
    return HttpResponse(xml_data, content_type="application/xml")

@login_required(login_url='/login')
def show_json(request):
    filter_type = request.GET.get('filter', 'all')
    
    if filter_type == "all":
        product_list = Product.objects.all()
    else:
        product_list = Product.objects.filter(user=request.user)
    
    json_data = serializers.serialize("json", product_list)
    return HttpResponse(json_data, content_type="application/json")

@login_required(login_url='/login')
def show_xml_by_id(request, product_id):
    try:
        product_item = Product.objects.filter(pk=product_id)
        xml_data = serializers.serialize("xml", product_item)
        return HttpResponse(xml_data, content_type="application/xml")
    except Product.DoesNotExist:
        return HttpResponse(status=404)

@login_required(login_url='/login')
def show_json_by_id(request, product_id):
    try:
        product_item = Product.objects.filter(pk=product_id)
        json_data = serializers.serialize("json", product_item)
        return HttpResponse(json_data, content_type="application/json")
    except Product.DoesNotExist:
        return HttpResponse(status=404)