document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const name_field = document.getElementById('name');
    const email_field = document.getElementById('email');
    const pwd = document.getElementById('password');
    const confirm_pwd = document.getElementById('confirmPassword');


    name_field.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('name', 'Name is required');
        } else if (this.value.length < 2) {
            show_error_msg('name', 'Name must be at least 2 characters');
        } else {
            hide_error_msg('name');
        }
    });

    email_field.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('email', 'Email is required');
        } else if (!validate_email(this.value)) {
            show_error_msg('email', 'Please enter a valid email address');
        } else {
            hide_error_msg('email');
        }
    });


    pwd.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('password', 'Password is required');
        } else if (this.value.length < 8) {
            show_error_msg('password', 'Password must be at least 8 characters');
        } else {
            hide_error_msg('password');
        }
    });

    confirm_pwd.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('confirmPassword', 'Please confirm your pwd');
        } else if (this.value !== pwd.value) {
            show_error_msg('confirmPassword', 'Passwords do not match');
        } else {
            hide_error_msg('confirmPassword');
        }
    });

    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(name_field.value) || name_field.value.length < 2) {
            show_error_msg('name', 'Name must be min 2 characters');
            isValid = false;
        }

        if (!validate_required(email_field.value) || !validate_email(email_field.value)) {
            show_error_msg('email', 'Please enter valid email address');
            isValid = false;
        }

        if (!validate_required(pwd.value) || pwd.value.length < 8) {
            show_error_msg('password', 'Password must be min 8 characters');
            isValid = false;
        }

        if (!validate_required(confirm_pwd.value) || confirm_pwd.value !== pwd.value) {
            show_error_msg('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});