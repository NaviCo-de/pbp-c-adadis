let currentProductId = null;
let currentFilter = 'all';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function refreshProducts() {
  const productGrid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  
  try {
    const response = await fetch(`/json/?filter=${currentFilter}`);
    const products = await response.json();
    
    if (products.length === 0) {
      productGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      productGrid.classList.remove('hidden');
      productGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to refresh products');
  }
}

function createProductCard(product) {
  const isOwner = product.fields.user === parseInt(document.getElementById('user-id')?.value || 0);
  
  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
      <div class="relative h-48 bg-gray-200">
        ${product.fields.thumbnail ? 
          `<img src="${product.fields.thumbnail}" alt="${product.fields.name}" class="w-full h-full object-cover">` :
          `<div class="w-full h-full flex items-center justify-center text-gray-400">No Image</div>`
        }
      </div>

      <div class="p-5">
        <h3 class="text-xl font-bold text-gray-900 mb-2 truncate">${product.fields.name}</h3>
        
        <div class="flex items-center justify-between mb-3">
          <span class="text-2xl font-bold text-blue-600">Rp ${parseInt(product.fields.price).toLocaleString('id-ID')}</span>
          <span class="text-sm text-gray-500">${product.fields.category}</span>
        </div>

        <p class="text-sm text-gray-600 mb-4">Stock: ${product.fields.stock}</p>

        <div class="space-y-2">
          <a href="/product/${product.pk}" 
            class="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            View Details
          </a>
          
          ${isOwner ? `
          <div class="grid grid-cols-2 gap-2">
            <button onclick="openEditModal('${product.pk}')" 
              class="bg-amber-500 text-white text-center py-2 rounded-lg font-medium hover:bg-amber-600 transition">
              Edit
            </button>
            <button onclick="openDeleteModal('${product.pk}', '${product.fields.name}')" 
              class="bg-red-500 text-white text-center py-2 rounded-lg font-medium hover:bg-red-600 transition">
              Delete
            </button>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function openCreateModal() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('submit-button').textContent = 'Add Product';
  document.getElementById('submit-button').className = 'flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition';
  
  document.getElementById('product-form').reset();
  currentProductId = null;
  
  document.getElementById('product-modal').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('product-modal').classList.add('show');
  }, 10);
}

async function openEditModal(productId) {
  currentProductId = productId;
  
  try {
    const response = await fetch(`/json/${productId}`);
    const data = await response.json();
    const product = data[0].fields;
    
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('submit-button').textContent = 'Update Product';
    document.getElementById('submit-button').className = 'flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition';
    
    document.getElementById('id_thumbnail').value = product.thumbnail || '';
    document.getElementById('id_name').value = product.name;
    document.getElementById('id_price').value = product.price;
    document.getElementById('id_stock').value = product.stock;
    document.getElementById('id_category').value = product.category;
    document.getElementById('id_description').value = product.description;
    
    document.getElementById('product-modal').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('product-modal').classList.add('show');
    }, 10);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to load product');
  }
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('show');
  setTimeout(() => {
    document.getElementById('product-modal').classList.add('hidden');
  }, 300);
}

async function submitProduct(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  submitButton.disabled = true;
  submitButton.textContent = 'Loading...';
  
  try {
    const url = currentProductId ? `/product/${currentProductId}/edit` : '/create-product';
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeModal();
      await refreshProducts();
      toast.success(data.message, currentProductId ? 'update' : 'create');
      form.reset();
      currentProductId = null;
    } else {
      toast.error(data.message || 'Failed to save product');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

function openDeleteModal(productId, productName) {
  currentProductId = productId;
  document.getElementById('delete-product-name').textContent = productName;
  document.getElementById('delete-modal').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('delete-modal').classList.add('show');
  }, 10);
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.remove('show');
  setTimeout(() => {
    document.getElementById('delete-modal').classList.add('hidden');
    currentProductId = null;
  }, 300);
}

async function confirmDelete() {
  if (!currentProductId) return;
  
  const deleteButton = document.getElementById('confirm-delete-button');
  const originalText = deleteButton.textContent;
  
  deleteButton.disabled = true;
  deleteButton.textContent = 'Deleting...';
  
  try {
    const response = await fetch(`/product/${currentProductId}/delete`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeDeleteModal();
      await refreshProducts();
      toast.success(data.message, 'delete');
    } else {
      toast.error(data.message || 'Failed to delete');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred');
  } finally {
    deleteButton.disabled = false;
    deleteButton.textContent = originalText;
  }
}

function setFilter(filter) {
  currentFilter = filter;
  refreshProducts();
}

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  currentFilter = urlParams.get('filter') || 'all';
  refreshProducts();
});