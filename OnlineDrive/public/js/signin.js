document.addEventListener('DOMContentLoaded', function() {
    var nextButton = document.querySelector('#next-button');
    var passwordContainer = document.querySelector('.password-container');
    var emailInput = document.querySelector('input[name="email"]');
    var passwordInput = document.querySelector('input[name="password"]');
    var rememberMeCheckbox = document.querySelector('input[name="rememberMe"]');
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');
    var isEmailValidated = false; // To track the state of email validation

    // Function to validate email format
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to handle click event on Next button
    function handleNextButtonClick() {
        if (!isEmailValidated) {
            if (!isValidEmail(emailInput.value)) {
                emailError.textContent = 'Email format is invalid';
                emailError.style.display = 'block';
                return;
            }
            emailError.style.display = 'none';
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
                    passwordContainer.style.display = 'block'; // Show password input
                    emailError.style.display = 'none';
                    nextButton.textContent = 'Sign In'; // Change button text to 'Sign In'
                    isEmailValidated = true; // Set the email validated flag
                }
            })
            .catch(err => {
                console.error('Error:', err);
                emailError.textContent = 'Failed to check email';
                emailError.style.display = 'block';
            });
        } else {
            handlePasswordCheck();
        }
    }
    
    function handlePasswordCheck() {
        fetch('/signin/password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value,
                rememberMe: rememberMeCheckbox.checked.toString() // Send string value of checked status
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                passwordError.textContent = data.message;
                passwordError.style.display = 'block';
            } else {
                window.location.href = '/index'; // Redirect on successful login
            }
        })
        .catch(err => {
            console.error('Error:', err);
            passwordError.textContent = 'Failed to verify password';
            passwordError.style.display = 'block';
        });
    }
    nextButton.addEventListener('click', handleNextButtonClick);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleNextButtonClick(); // Call the same function for Enter key press
        }
    });

    var forgotPasswordLink = document.querySelector('.forgot');
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default behavior of link
        window.location.href = '/forgotpassword'; // Navigate to the forgot password page
    });
});

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

function goToSignup() {
    window.location.href = "/signup";
}