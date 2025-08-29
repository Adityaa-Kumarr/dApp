// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Get the form and modal elements
    const form = document.getElementById('create-id-form');
    const modal = document.getElementById('fingerprint-modal');

    // Add an event listener for the form submission
    form.addEventListener('submit', (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Check if the form is valid (basic check)
        if (form.checkValidity()) {
            // Show the fingerprint modal
            modal.style.display = 'flex';

            // Set a timeout to redirect to the upload page after a few seconds
            setTimeout(() => {
                window.location.href = 'upload/upload.html';
            }, 3000); // Redirect after 3 seconds
        } else {
            // If form is invalid, trigger browser's validation messages
            form.reportValidity();
        }
    });
});