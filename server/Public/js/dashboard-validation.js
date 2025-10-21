//to avoid confusion- this is for user dashboard
document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const emailForm = document.getElementById('email-form');

    if (profileForm) {
        const nameField = document.getElementById('name');

        nameField.addEventListener('blur', function () {
            const namePattern = /^[A-Za-z\s]+$/;
            if (!validate_required(this.value)) {
                show_error_msg('name', 'Name is required');
            } else if (!namePattern.test(this.value)) {
                show_error_msg('name', 'Name must contain only letters and spaces');
            } else if (this.value.length < 2) {
                show_error_msg('name', 'Name must be at least 2 characters');
            } else {
                hide_error_msg('name');
            }
        });

        profileForm.addEventListener('submit', function (e) {
            const namePattern = /^[A-Za-z\s]+$/;
            if (!validate_required(nameField.value) || !namePattern.test(nameField.value) || nameField.value.length < 2) {
                show_error_msg('name', 'Please enter a valid name');
                e.preventDefault();
            }
        });
    }

    if (passwordForm) {
        const curr_pwd = document.getElementById('currentPassword');
        const new_ped = document.getElementById('newPassword');
        const conf_pwd = document.getElementById('confirmPassword');

        curr_pwd.addEventListener('blur', function () {
            if (!validate_required(this.value)) {
                show_error_msg('currentPassword', 'Current password is required');
            } else {
                hide_error_msg('currentPassword');
            }
        });

        new_ped.addEventListener('blur', function () {
            if (!validate_required(this.value)) {
                show_error_msg('newPassword', 'New password is required');
            } else if (this.value.length < 8) {
                show_error_msg('newPassword', 'New password must be at least 8 characters');
            } else {
                hide_error_msg('newPassword');
            }
        });

        conf_pwd.addEventListener('blur', function () {
            if (!validate_required(this.value)) {
                show_error_msg('confirmPassword', 'Please confirm your new password');
            } else if (this.value !== new_ped.value) {
                show_error_msg('confirmPassword', 'Passwords do not match');
            } else {
                hide_error_msg('confirmPassword');
            }
        });

        passwordForm.addEventListener('submit', function (e) {
            let isValid = true;

            if (!validate_required(curr_pwd.value)) {
                show_error_msg('currentPassword', 'Current password is required');
                isValid = false;
            }

            if (!validate_required(new_ped.value) || new_ped.value.length < 8) {
                show_error_msg('newPassword', 'New password must be at least 8 characters');
                isValid = false;
            }

            if (!validate_required(conf_pwd.value) || conf_pwd.value !== new_ped.value) {
                show_error_msg('confirmPassword', 'Passwords do not match');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    if (emailForm) {
        const newEmailField = document.getElementById('newEmail');
        const emailPasswordField = document.getElementById('emailPassword');

        newEmailField.addEventListener('blur', function () {
            if (!validate_required(this.value)) {
                show_error_msg('newEmail', 'New email is required');
            } else if (!validate_email(this.value)) {
                show_error_msg('newEmail', 'Please enter a email address');
            } else {
                hide_error_msg('newEmail');
            }
        });

        emailPasswordField.addEventListener('blur', function () {
            if (!validate_required(this.value)) {
                show_error_msg('emailPassword', 'Password is required to update email');
            } else {
                hide_error_msg('emailPassword');
            }
        });

        emailForm.addEventListener('submit', function (e) {
            let isValid = true;

            if (!validate_required(newEmailField.value) || !validate_email(newEmailField.value)) {
                show_error_msg('newEmail', 'Please enter a valid email address');
                isValid = false;
            }

            if (!validate_required(emailPasswordField.value)) {
                show_error_msg('emailPassword', 'Password is required to update email');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }
});