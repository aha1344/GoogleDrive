document.addEventListener("DOMContentLoaded", function() {
    var nextButton = document.querySelector('#next-button');
    var passwordContainer = document.querySelector('.password-container');
    var emailInput = document.querySelector('input[name="email"]');
    var passwordInput = document.querySelector('input[name="password"]');
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function handleNextButtonClick() {
        if (passwordContainer.style.display === 'none') {
            if (!isValidEmail(emailInput.value)) {
                emailError.textContent = 'Email format is invalid';
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
                    nextButton.onclick = handlePasswordCheck;  // Change the button's function to check the password next
                }
            })
            .catch(err => {
                console.error('Error:', err);
                emailError.textContent = 'Failed to check email';
                emailError.style.display = 'block';
            });
        }
    }

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
                passwordError.style.display = 'none';
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
            if (passwordContainer.style.display === 'none') {
                handleNextButtonClick();
            } else {
                handlePasswordCheck();
            }
        }
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
