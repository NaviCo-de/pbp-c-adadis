// Toast Notification Component
class Toast {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-3';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'create') {
    const toastConfig = {
      create: {
        bgColor: 'bg-green-600',
        title: 'Product Created'
      },
      update: {
        bgColor: 'bg-amber-600',
        title: 'Product Updated'
      },
      delete: {
        bgColor: 'bg-red-600',
        title: 'Product Deleted'
      },
      login: {
        bgColor: 'bg-blue-600',
        title: 'Login Successful'
      },
      logout: {
        bgColor: 'bg-red-600',
        title: 'Logged Out'
      },
      register: {
        bgColor: 'bg-green-600',
        title: 'Registration Successful'
      },
      error: {
        bgColor: 'bg-red-600',
        title: 'Error'
      }
    };

    const config = toastConfig[type] || toastConfig.error;
    
    const toast = document.createElement('div');
    toast.className = `transform transition-all duration-300 ease-in-out translate-x-full`;
    toast.innerHTML = `
      <div class="${config.bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-start space-x-4 min-w-[320px]">
        <div class="flex-1">
          <h4 class="font-bold mb-1">${config.title}</h4>
          <p class="text-sm">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 5000);
  }

  success(message, type = 'create') {
    this.show(message, type);
  }

  error(message) {
    this.show(message, 'error');
  }
}

const toast = new Toast();