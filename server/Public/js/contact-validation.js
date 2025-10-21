
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const name_field = document.getElementById('name');
    const email_field = document.getElementById('email');
    const phone = document.getElementById('phone');
    const sub = document.getElementById('subject');
    const msg = document.getElementById('message');


    name_field.addEventListener('blur', function () {
        if (!validate_required(this.value)) {
            show_error_msg('name', 'Name is required');
        } else if (this.value.length < 2) {
            show_error_msg('name', 'Name must be at least 2 characters');
        } else {
            hide_error_msg('name');
        }
    });


    email_field.addEventListener('blur', function () {
        if (!validate_required(this.value)) {
            show_error_msg('email', 'Email is required');
        } else if (!validate_email(this.value)) {
            show_error_msg('email', 'Please enter a valid email address');
        } else {
            hide_error_msg('email');
        }
    });


    phone.addEventListener('blur', function () {
        const num_pattern = /^[0-9]{10}$/;
        if (!validate_required(this.value)) {
            show_error_msg('phone', 'Phone number is required');
        } else if (!num_pattern.test(this.value)) {
            show_error_msg('phone', 'Please enter a 10 digit phone number');
        } else {
            hide_error_msg('phone');
        }
    });

    sub.addEventListener('blur', function () {
        if (!validate_required(this.value)) {
            show_error_msg('subject', 'Subject is required');
        } else if (this.value.length < 3) {
            show_error_msg('subject', 'Subject must be at least 3 characters');
        } else {
            hide_error_msg('subject');
        }
    });


    msg.addEventListener('blur', function () {
        if (!validate_required(this.value)) {
            show_error_msg('message', 'Message is required');
        } else if (this.value.length < 10) {
            show_error_msg('message', 'Message must be at least 10 characters');
        } else {
            hide_error_msg('message');
        }
    });

    //last check before submit
    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(name_field.value) || name_field.value.length < 2) {
            show_error_msg('name', 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!validate_required(email_field.value) || !validate_email(email_field.value)) {
            show_error_msg('email', 'Please enter a valid email address');
            isValid = false;
        }

        const num_pattern = /^[0-9]{10}$/;
        if (!validate_required(phone.value) || !num_pattern.test(phone.value)) {
            show_error_msg('phone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        if (!validate_required(sub.value) || sub.value.length < 3) {
            show_error_msg('subject', 'Subject must be at least 3 characters');
            isValid = false;
        }

        if (!validate_required(msg.value) || msg.value.length < 10) {
            show_error_msg('message', 'Message must be at least 10 characters');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});