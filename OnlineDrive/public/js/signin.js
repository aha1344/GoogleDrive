document.addEventListener('DOMContentLoaded', function() {
    document.title = 'Sign in - Google Drive';
    var nextButton = document.querySelector('#next-button');
    var passwordContainer = document.querySelector('.password-container');
    var emailInput = document.querySelector('input[name="email"]');
    var passwordInput = document.querySelector('input[name="password"]');
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');

    // Function to validate email format
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to handle click event on Next button
    function handleNextButtonClick() {
        if (passwordContainer.style.display === 'none') {
            if (!isValidEmail(emailInput.value)) {
                emailError.style.display = 'block';
                return;
            }
            fetch('/signin/email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: emailInput.value })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    emailError.textContent = data.message;  // 'Email does not exist'
                    emailError.style.display = 'block';
                } else {
                    passwordContainer.style.display = 'block';
                    emailError.style.display = 'none';
                    nextButton.removeEventListener('click', handleNextButtonClick); // Remove the previous event listener
                    nextButton.addEventListener('click', handlePasswordCheck);  // Add event listener for password check
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
        fetch('/signin/password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                passwordError.textContent = data.message;  // 'Password is incorrect'
                passwordError.style.display = 'block';
            } else {
                window.location.href = '/index';  // Redirect on successful login
            }
        })
        .catch(err => {
            console.error('Error:', err);
            passwordError.textContent = 'Failed to verify password';
            passwordError.style.display = 'block';
        });
    }

    // Event listener for click event on Next button
    nextButton.addEventListener('click', handleNextButtonClick);

    // Event listener for keydown event (Enter key)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (passwordContainer.style.display === 'none') {
                handleNextButtonClick();
            } else {
                handlePasswordCheck();
            }
        }
    });

    // Event listener for click event on "Forgot password?" link
    var forgotPasswordLink = document.querySelector('.forgot');
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent default behavior of link (i.e., navigating to the href)
        window.location.href = '/forgotpassword';  // Navigate to the forgot password page
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

// Function to navigate to signup page
function goToSignup() {
    window.location.href = "/signup";
}