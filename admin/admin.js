// Animate form on load
window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.classList.add("active");
  }
});

// Handle login form submission
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent the form from submitting normally

    // --- Hardcoded Credentials for Demo ---
    const correctUsername = "admin";
    const correctPassword = "123";

    // Get user input from the form
    const enteredUsername = document.getElementById("username").value;
    const enteredPassword = document.getElementById("password").value;

    // --- Authentication Check ---
    if (enteredUsername === correctUsername && enteredPassword === correctPassword) {
      // If credentials are correct
      errorMessage.textContent = ""; // Clear any previous error messages
      console.log("Login successful! Redirecting...");
      
      // Redirect to the create ID page
      window.location.href = "./createid/createid.html";

    } else {
      // If credentials are incorrect
      console.error("Login failed: Invalid credentials.");
      errorMessage.textContent = "Invalid username or password. Please try again.";
    }
  });
}

