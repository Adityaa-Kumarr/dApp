// Animate form on load
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".login-form").classList.add("active");
});

// Handle login form submit
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    alert(`Logged in as: ${email}`);
    // Here you can integrate backend / blockchain auth
  } else {
    alert("Please enter valid credentials.");
  }
});
