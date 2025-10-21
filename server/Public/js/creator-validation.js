document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    if (profileForm) {
        const name_field = document.getElementById('name');
        const organisation = document.getElementById('organization');
        const phone = document.getElementById('phone');
        const website = document.getElementById('website');

        name_field.addEventListener('input', function () {
            const name_regex = /^[A-Za-z\s]+$/;
            if (!validate_required(this.value)) {
                show_error_msg('name', 'Name is required');
            } else if (!name_regex.test(this.value)) {
                show_error_msg('name', 'Name must contain only letters and spaces');
            } else if (this.value.length < 2) {
                show_error_msg('name', 'Name must be at least 2 characters');
            } else {
                hide_error_msg('name');
            }
        });

        organisation.addEventListener('input', function () {
            if (this.value && this.value.length < 2) {
                show_error_msg('organization', 'Organization name must be at least 2 characters');
            } else {
                hide_error_msg('organization');
            }
        });

        phone.addEventListener('input', function () {
            const phone_regex = /^[0-9]{10}$/;
            if (this.value && !phone_regex.test(this.value)) {
                show_error_msg('phone', 'Please enter a valid 10-digit phone number');
            } else {
                hide_error_msg('phone');
            }
        });

        website.addEventListener('input', function () {
            const url_regex = /^https?:\/\/.+/;
            if (this.value && !url_regex.test(this.value)) {
                show_error_msg('website', 'Please enter a valid website URL starting with http:// or https://');
            } else {
                hide_error_msg('website');
            }
        });

        profileForm.addEventListener('submit', function (e) {
            let isValid = true;
            const name_regex = /^[A-Za-z\s]+$/;
            const phone_regex = /^[0-9]{10}$/;
            const url_regex = /^https?:\/\/.+/;

            if (!validate_required(name_field.value) || !name_regex.test(name_field.value) || name_field.value.length < 2) {
                show_error_msg('name', 'Nname must be > 2 char');
                isValid = false;
            }

            if (organisation.value && organisation.value.length < 2) {
                show_error_msg('organization', 'org name must be at least 2 characters');
                isValid = false;
            }

            if (phone.value && !phone_regex.test(phone.value)) {
                show_error_msg('phone', 'Please enter a 10 digit phone number');
                isValid = false;
            }

            if (website.value && !url_regex.test(website.value)) {
                show_error_msg('website', 'Please enter a valid website URL');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    if (passwordForm) {
        const curr_pwd = document.getElementById('currentPassword');
        const new_pwd = document.getElementById('newPassword');
        const conf_pwd = document.getElementById('confirmPassword');

        curr_pwd.addEventListener('input', function () {
            if (!validate_required(this.value)) {
                show_error_msg('currentPassword', 'Current password is required');
            } else {
                hide_error_msg('currentPassword');
            }
        });

        new_pwd.addEventListener('input', function () {
            if (!validate_required(this.value)) {
                show_error_msg('newPassword', 'New password is required');
            } else if (this.value.length < 8) {
                show_error_msg('newPassword', 'New password must be at least 8 characters');
            } else {
                hide_error_msg('newPassword');
            }
        });

        conf_pwd.addEventListener('input', function () {
            if (!validate_required(this.value)) {
                show_error_msg('confirmPassword', 'Please confirm your new password');
            } else if (this.value !== new_pwd.value) {
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

            if (!validate_required(new_pwd.value) || new_pwd.value.length < 8) {
                show_error_msg('newPassword', 'New password must be at least 8 characters');
                isValid = false;
            }

            if (!validate_required(conf_pwd.value) || conf_pwd.value !== new_pwd.value) {
                show_error_msg('confirmPassword', 'Passwords do not match');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }
});