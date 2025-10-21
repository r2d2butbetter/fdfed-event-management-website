// Login form validation
document.addEventListener('DOMContentLoaded', function () {

    const form = document.querySelector('form');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    // validate email
    emailField.addEventListener('blur', function () { //BLUR IS SO USEFUL OMG
        if (!validate_required(this.value)) {
            show_error_msg('email', 'Email is required');
        } else if (!validate_email(this.value)) {
            show_error_msg('email', 'Please enter a valid email address');
        } else {
            hide_error_msg('email');
        }
    });

    // pwd validation
    passwordField.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('password', 'Password is required');
        } else if (this.value.length < 8) {
            show_error_msg('password', 'Password must be at least 8 characters');
        } else {
            hide_error_msg('password');
        }
    });

    // Form submission validation
    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(emailField.value) || !validate_email(emailField.value)) {
            show_error_msg('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!validate_required(passwordField.value) || passwordField.value.length < 8) {
            show_error_msg('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});