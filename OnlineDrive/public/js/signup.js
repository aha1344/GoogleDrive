// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set the document title
    document.title = 'Sign up - Google Drive';

    // Get references to various DOM elements
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

    // Function to check if an email is valid
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to check if a password is weak
    function isWeakPassword(password) {
        return password.length < 8;
    }

    // Function to display an error message for an input element
    function displayError(inputElement, errorElement, message) {
        if (!inputElement.value.trim()) {
            errorElement.textContent = message;
            return false;
        }
        errorElement.textContent = '';
        return true;
    }

    // Function to toggle password visibility
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

    // Function to validate inputs and proceed to the next step
    function validateAndProceed() {
        if (currentStep === 0) {
            var valid = true; 
            valid &= displayError(firstNameInput, firstNameError, 'First name cannot be empty');
            valid &= displayError(lastNameInput, lastNameError, 'Last name cannot be empty');
            if (!valid) return; 
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

    // Function to submit the form data
    function submitForm() {
        var formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        // Send a POST request to submit the form data
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
            goToSignin(); // Redirect to the sign-in page on successful form submission
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit form.');
        });
    }

    // Event listener for the next button click
    nextButton.addEventListener('click', validateAndProceed);

    // Event listener for toggling password visibility
    eyeIcon.addEventListener('click', togglePasswordVisibility);

    // Event listener for keydown events on input fields
    [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                validateAndProceed(); // Validate and proceed when Enter key is pressed
                event.preventDefault();
            }
        });
    });
});

// Function to redirect to the sign-in page
function goToSignin() {
    window.location.href = "/signin";
}
