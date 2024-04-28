// This function executes when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Variables to capture specific HTML elements
    var nextButton = document.getElementById('next-button');
    var emailSection = document.getElementById('email');
    var emailInput = document.querySelector('#email input[type="email"]');
    var emailNotValid = document.getElementById('emailNotValid');
    var passwordSection = document.getElementById('password');

    // Event listener for the 'Next' button
    nextButton.addEventListener('click', function() {
        // Check if the email section is visible
        if (emailSection.style.display !== 'none') {
            var email = emailInput.value;
            // Validate the email using the isValidEmail function
            if (isValidEmail(email)) {
                // Hide email section and show password section
                emailSection.style.display = 'none';
                passwordSection.style.display = 'block';
            } else {
                // Display error message if email is not valid
                if (emailNotValid) emailNotValid.style.display = 'block';
            }
        } else {
            // Capture password inputs and related error messages
            var passwordInput = document.getElementById('password1').value;
            var confirmPasswordInput = document.getElementById('password2').value;
            var passwordNotValid1 = document.getElementById('passwordNotValid1');
            var passwordNotValid2 = document.getElementById('passwordNotValid2');
            var passwordMissing1 = document.getElementById('passwordMissing1');
            var passwordMissing2 = document.getElementById('passwordMissing2');

            // Check if passwords are empty and display respective error messages
            if (passwordInput == "") {
                passwordMissing1.style.display = 'block';
                passwordMissing2.style.display = 'none';
                passwordNotValid1.style.display = 'none';
                passwordNotValid2.style.display = 'none';
            } else if (confirmPasswordInput == "") {
                passwordMissing2.style.display = 'block';
                passwordMissing1.style.display = 'none';
                passwordNotValid1.style.display = 'none';
                passwordNotValid2.style.display = 'none';
            } else
            // If passwords match, send a request to change password
            if (passwordInput === confirmPasswordInput) {
                var email = emailInput.value;
                var newPassword = passwordInput;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/forgotpassword/change', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        // Redirect to sign-in page upon successful password change
                        window.location.href = '/signin';
                    }
                };
                xhr.send(JSON.stringify({ email: email, newPassword: newPassword }));
            } else {
                // Display error message if passwords do not match
                if (passwordNotValid1) passwordNotValid1.style.display = 'block';
                if (passwordNotValid2) passwordNotValid2.style.display = 'block';
                passwordMissing1.style.display = 'none';
                passwordMissing2.style.display = 'none';
            }
        }
    });
});

// Function to validate email format using a regular expression
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[cC][oO][mM]$/.test(email);
}

// Function to toggle visibility of password input and change eye icon
function show1() {
    var eye = document.getElementById('eye1');
    var passwordInput = document.getElementById('password1');

    // Toggle password input visibility and eye icon class
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

// Function similar to show1, but for the second password input
function show2() {
    var eye = document.getElementById('eye2');
    var passwordInput = document.getElementById('password2');

    // Toggle password input visibility and eye icon class
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