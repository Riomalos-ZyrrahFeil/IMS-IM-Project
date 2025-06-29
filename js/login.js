// Utility function for email validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const signInBtn = document.getElementById('signInBtn');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Focus on email input for better UX
    emailInput.focus();

    // Show error function
    function showError(input, message, errorDiv) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        errorDiv.textContent = message || '';
    }

    // Clear error function
    function clearError(input, errorDiv) {
        input.classList.remove('input-error');
        input.setAttribute('aria-invalid', 'false');
        errorDiv.textContent = '';
    }

    // Check form validity
    function checkValidity() {
        let valid = true;

        // Validate Email
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email.', emailError);
            valid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Enter a valid email address.', emailError);
            valid = false;
        } else {
            clearError(emailInput, emailError);
        }

        // Validate Password
        if (!passwordInput.value.trim()) {
            showError(passwordInput, 'Please enter your password.', passwordError);
            valid = false;
        } else {
            clearError(passwordInput, passwordError);
        }

        // Enable/Disable Button
        signInBtn.disabled = !valid;
        signInBtn.setAttribute('aria-disabled', !valid ? 'true' : 'false');
        return valid;
    }

    // Real-time validation on input
    emailInput.addEventListener('input', checkValidity);
    passwordInput.addEventListener('input', checkValidity);

    // Validation on blur (when user leaves the field)
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() && !validateEmail(emailInput.value)) {
            showError(emailInput, 'Enter a valid email address.', emailError);
        }
    });

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value.trim()) {
            showError(passwordInput, 'Please enter your password.', passwordError);
        }
    });

    // Form submit event
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        if (!checkValidity()) {
            return;
        }

        // Simulate login process
        signInBtn.textContent = "Signing In...";
        signInBtn.disabled = true;

        // Simulate async login (replace with actual authentication)
        setTimeout(() => {
            // Success simulation
            alert('Login successful!\n\nRedirecting to dashboard...');
            
            // In a real application, you would redirect to the dashboard:
            // window.location.href = 'dashboard.html';
            
            // Reset button for demo purposes
            signInBtn.textContent = "Sign In";
            signInBtn.disabled = false;
            
            // Clear form
            form.reset();
            checkValidity();
        }, 2000);
    });

    // Enter key support for better UX
    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !signInBtn.disabled) {
            form.dispatchEvent(new Event('submit'));
        }
    });
});

// Additional utility functions for future enhancement
function showNotification(message, type = 'info') {
    // Could be used to show toast notifications
    console.log(`${type.toUpperCase()}: ${message}`);
}

function togglePasswordVisibility() {
    // Function to add password visibility toggle (can be enhanced later)
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}
