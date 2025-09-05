from django.shortcuts import render

# Create your views here.
def show_main(request):
    context = {
        'npm' : '2406432103',
        'nama': 'Darrell',
        'kelas': 'PBP C'
    }

    return render(request, "main.html", context)