document.addEventListener('DOMContentLoaded', function() {
    var nextButton = document.getElementById('next-button');
    var emailSection = document.getElementById('email');
    var emailInput = document.querySelector('#email input[type="email"]'); 
    var emailNotValid = document.getElementById('emailNotValid'); 
    var passwordSection = document.getElementById('password');

    nextButton.addEventListener('click', function() {
        if (emailSection.style.display !== 'none') {
            var email = emailInput.value;
            if (isValidEmail(email)) {
                emailSection.style.display = 'none';
                passwordSection.style.display = 'block';
            } else {
                if (emailNotValid) emailNotValid.style.display = 'block';
            }
        } else {
            var passwordInput = document.getElementById('password1').value;
            var confirmPasswordInput = document.getElementById('password2').value;
            var passwordNotValid1 = document.getElementById('passwordNotValid1');
            var passwordNotValid2 = document.getElementById('passwordNotValid2');
            var passwordMissing1 = document.getElementById('passwordMissing1');
            var passwordMissing2 = document.getElementById('passwordMissing2');

            if (passwordInput == ""){
                 passwordMissing1.style.display = 'block';
                 passwordMissing2.style.display = 'none';
                 passwordNotValid1.style.display = 'none';
                 passwordNotValid2.style.display = 'none';
            }else if (confirmPasswordInput == ""){
                passwordMissing2.style.display = 'block';
                passwordMissing1.style.display = 'none';
                passwordNotValid1.style.display = 'none';
                 passwordNotValid2.style.display = 'none';
            }else
            if (passwordInput === confirmPasswordInput) {
                // Send request to change password
                var email = emailInput.value;
                var newPassword = passwordInput;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/forgotpassword/change', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        // Password changed successfully, redirect to sign-in page
                        window.location.href = '/signin';
                    }
                };
                xhr.send(JSON.stringify({ email: email, newPassword: newPassword }));
            } else {
                if (passwordNotValid1) passwordNotValid1.style.display = 'block';
                if (passwordNotValid2) passwordNotValid2.style.display = 'block';
                passwordMissing1.style.display = 'none';
                passwordMissing2.style.display = 'none';
            } 
        }
    });
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[cC][oO][mM]$/.test(email);
}

function show1(){
    var eye = document.getElementById('eye1');
    var passwordInput = document.getElementById('password1');
    
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

function show2(){
    var eye = document.getElementById('eye2');
    var passwordInput = document.getElementById('password2');
    
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
