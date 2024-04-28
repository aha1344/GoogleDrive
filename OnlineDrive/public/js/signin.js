// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set the document title
    document.title = 'Sign in - Google Drive';

    // Get references to various DOM elements
    var nextButton = document.querySelector('#next-button');
    var passwordContainer = document.querySelector('.password-container');
    var emailInput = document.querySelector('input[name="email"]');
    var passwordInput = document.querySelector('input[name="password"]');
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');

    // Function to check if an email is valid
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to handle next button click
    function handleNextButtonClick() {
        if (passwordContainer.style.display === 'none') {
            if (!isValidEmail(emailInput.value)) {
                emailError.style.display = 'block';
                return;
            }
            // Send a POST request to check the email
            fetch('/signin/email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: emailInput.value })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    emailError.textContent = data.message; 
                    emailError.style.display = 'block';
                } else {
                    passwordContainer.style.display = 'block';
                    emailError.style.display = 'none';
                    nextButton.removeEventListener('click', handleNextButtonClick); 
                    nextButton.addEventListener('click', handlePasswordCheck); 
                }
            })
            .catch(err => {
                console.error('Error:', err);
                emailError.textContent = 'Failed to check email';
                emailError.style.display = 'block';
            });
        }
    }

    // Function to handle password check
    function handlePasswordCheck() {
        const rememberMe = document.querySelector('#rememberMe').checked;
        // Send a POST request to verify the password
        fetch('/signin/password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value, rememberMe: rememberMe })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                passwordError.textContent = data.message; 
                passwordError.style.display = 'block';
            } else {
                window.location.href = '/index'; // Redirect on successful sign-in
            }
        })
        .catch(err => {
            console.error('Error:', err);
            passwordError.textContent = 'Failed to verify password';
            passwordError.style.display = 'block';
        });
    }

    // Event listener for the next button click
    nextButton.addEventListener('click', handleNextButtonClick);

    // Event listener for keydown events on the document
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (passwordContainer.style.display === 'none') {
                handleNextButtonClick(); // Handle next button click when Enter key is pressed
            } else {
                handlePasswordCheck(); // Handle password check when Enter key is pressed
            }
        }
    });

    // Event listener for clicking on the forgot password link
    var forgotPasswordLink = document.querySelector('.forgot');
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        window.location.href = '/forgotpassword'; // Redirect to forgot password page
    });
});

// Function to toggle password visibility
function togglePasswordVisibility() {
    var eye = document.getElementById('eye');
    var passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
}

// Function to redirect to the sign-up page
function goToSignup() {
    window.location.href = "/signup";
}
