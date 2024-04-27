document.addEventListener('DOMContentLoaded', function() {
    var nextButton = document.getElementById('next-button');
    var firstNameError = document.getElementById('firstNameError');
    var lastNameError = document.getElementById('lastNameError');
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');
    var nameContainer = document.querySelector('.name-container');
    var emailContainer = document.querySelector('.email-container');
    var passwordContainer = document.querySelector('.password-container');
    var firstNameInput = document.querySelector('input[name="firstName"]');
    var lastNameInput = document.querySelector('input[name="lastName"]');
    var emailInput = document.querySelector('input[name="email"]');
    var passwordInput = document.querySelector('input[name="password"]');
    var eyeIcon = document.getElementById('eye');
    var currentStep = 0;

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isWeakPassword(password) {
        return password.length < 8;
    }

    function displayError(inputElement, errorElement, message) {
        if (!inputElement.value.trim()) {
            errorElement.textContent = message;
            return false;
        }
        errorElement.textContent = '';
        return true;
    }

    function togglePasswordVisibility() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.add('fa-eye-slash');
            eyeIcon.classList.remove('fa-eye');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.add('fa-eye');
            eyeIcon.classList.remove('fa-eye-slash');
        }
    }

    function validateAndProceed() {
        if (currentStep === 0) {
            var valid = true; // Reset validity state
            valid &= displayError(firstNameInput, firstNameError, 'First name cannot be empty');
            valid &= displayError(lastNameInput, lastNameError, 'Last name cannot be empty');
            if (!valid) return; // Stop progression if not valid
            nameContainer.style.display = 'none';
            emailContainer.style.display = 'block';
            currentStep++;
        } else if (currentStep === 1) {
            if (!isValidEmail(emailInput.value.trim())) {
                emailError.textContent = 'Email is invalid';
                return;
            }
            emailError.textContent = '';
            emailContainer.style.display = 'none';
            passwordContainer.style.display = 'block';
            nextButton.textContent = 'Submit';
            currentStep++;
        } else if (currentStep === 2) {
            if (isWeakPassword(passwordInput.value.trim())) {
                passwordError.textContent = 'Password is weak';
                return;
            }
            passwordError.textContent = '';
            submitForm();
        }
    }

    function submitForm() {
        var formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create account');
            }
            // Redirect to signin.html if the POST was successful
            goToSignin(); 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit form.');
        });
    }
    nextButton.addEventListener('click', validateAndProceed);

    eyeIcon.addEventListener('click', togglePasswordVisibility);

    [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                validateAndProceed();
                event.preventDefault();
            }
        });
    });
});
function goToSignin() {
    window.location.href = "/signin";
}
