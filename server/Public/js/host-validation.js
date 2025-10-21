document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const org_name = document.getElementById('orgName');
    const phone = document.getElementById('mobile');
    const desc = document.getElementById('description');

    org_name.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('orgName', 'org name is required');
        } else if (this.value.length < 2) {
            show_error_msg('orgName', 'organisation name must be at least 2 characters');
        } else {
            hide_error_msg('orgName');
        }
    });

    phone.addEventListener('input', function () {
        const mobilePattern = /^[0-9]{10}$/;
        if (!validate_required(this.value)) {
            show_error_msg('mobile', 'phone no. is required');
        } else if (!mobilePattern.test(this.value)) {
            show_error_msg('mobile', 'Please enter 10 digit mobile number');
        } else {
            hide_error_msg('mobile');
        }
    });


    desc.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('description', 'Description is required');
        } else if (this.value.length < 20) {
            show_error_msg('description', 'Description must be at least 20 characters');
        } else {
            hide_error_msg('description');
        }
    });

    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(org_name.value) || org_name.value.length < 2) {
            show_error_msg('orgName', 'Organization name must be at least 2 characters');
            isValid = false;
        }

        const mobilePattern = /^[0-9]{10}$/;
        if (!validate_required(phone.value) || !mobilePattern.test(phone.value)) {
            show_error_msg('mobile', 'Please enter a valid 10-digit mobile number');
            isValid = false;
        }

        if (!validate_required(desc.value) || desc.value.length < 20) {
            show_error_msg('description', 'Description must be at least 20 characters');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});