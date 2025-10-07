// Login Handler
function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  
  submitButton.disabled = true;
  submitButton.innerHTML = 'Loading...';
  
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      toast.success(data.message, 'login');
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1000);
    } else {
      const errorContainer = document.getElementById('error-container');
      errorContainer.innerHTML = '';
      
      if (data.errors) {
        Object.keys(data.errors).forEach(field => {
          data.errors[field].forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-50 border-l-4 border-red-500 p-4 rounded mb-2';
            errorDiv.innerHTML = `<p class="text-red-700 text-sm">${error}</p>`;
            errorContainer.appendChild(errorDiv);
          });
        });
      }
      
      toast.error(data.message || 'Login failed');
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    toast.error('An error occurred');
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  });
}

// Register Handler
function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  
  submitButton.disabled = true;
  submitButton.innerHTML = 'Loading...';
  
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      toast.success(data.message, 'register');
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1000);
    } else {
      const errorContainer = document.getElementById('error-container');
      errorContainer.innerHTML = '';
      
      if (data.errors) {
        Object.keys(data.errors).forEach(field => {
          data.errors[field].forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-50 border-l-4 border-red-500 p-4 rounded mb-2';
            errorDiv.innerHTML = `<p class="text-red-700 text-sm">${error}</p>`;
            errorContainer.appendChild(errorDiv);
          });
        });
      }
      
      toast.error(data.message || 'Registration failed');
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    toast.error('An error occurred');
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  });
}