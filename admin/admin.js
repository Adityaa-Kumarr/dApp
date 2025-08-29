document.addEventListener('DOMContentLoaded', () => {
    // --- Store your admin accounts here ---
    // In a real application, this data would come from a secure backend server.
    const adminAccounts = [
        { username: 'admin', password: 'password123' },
        { username: 'super_admin', password: 'super_secure_pass' },
        { username: 'tech_support', password: 'support@2025' }
    ];

    const form = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // It's good practice to have an element for messages
    // Add <p id="login-message"></p> inside your form in the HTML to use this
    const messageElement = document.getElementById('login-message') || document.createElement('p');
    if (!document.getElementById('login-message')) {
        messageElement.id = 'login-message';
        form.appendChild(messageElement);
    }
    

    form.addEventListener('submit', (event) => {
        // Prevent the form from reloading the page
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value;

        // Find a user in the array that matches the input credentials
        const validUser = adminAccounts.find(
            (account) => account.username === enteredUsername && account.password === enteredPassword
        );

        if (validUser) {
            // If a match is found
            messageElement.textContent = `Welcome, ${validUser.username}! Logging in...`;
            messageElement.style.color = 'green';

            // Redirect to a dashboard after a short delay
            setTimeout(() => {
                // Replace 'admin-dashboard.html' with your actual dashboard page
                window.location.href = 'admin-dashboard.html';
            }, 1500);

        } else {
            // If no match is found
            messageElement.textContent = 'Invalid username or password. Please try again.';
            messageElement.style.color = 'red';
        }
    });
});