// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // Get references to the HTML elements we need to work with
  const loginForm = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');

  // Add an event listener to the form to handle the 'submit' event
  loginForm.addEventListener('submit', (event) => {
    // Prevent the default form submission, which would reload the page
    event.preventDefault();

    // Get the values entered by the user and trim any whitespace
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // --- IMPORTANT ---
    // This is a basic front-end check for demonstration purposes ONLY.
    // In a real application, you would send this data to a secure server for validation.
    // NEVER store actual passwords or handle logins like this in production code.
    if (email === 'admin' && password === '123') {
      // If credentials are correct, show a success message
      errorMessage.textContent = 'Login successful! Redirecting...';
      errorMessage.style.color = 'green';

      // Simulate redirecting to an admin dashboard after 2 seconds
      setTimeout(() => {
        // In a real app, you would redirect to the admin dashboard page
        window.location.href = './dashboard.html';
      }, 2000);

    } else {
      // If credentials are incorrect, show an error message
      errorMessage.textContent = 'Invalid username or password. Please try again.';
      errorMessage.style.color = 'red';
    }
  });
});