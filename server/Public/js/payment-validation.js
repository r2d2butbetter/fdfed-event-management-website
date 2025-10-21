// Payment form validation
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const name_field = document.getElementById('name');
    const tickets = document.getElementById('tickets');
    const card_no = document.getElementById('cardNumber');
    const expiry = document.getElementById('expiry');
    const cvv = document.getElementById('cvv');
    const upiid = document.getElementById('upiId');


    name_field.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('name', 'Name is required');
        } else if (this.value.length < 2) {
            show_error_msg('name', 'Name must be at least 2 characters');
        } else {
            hide_error_msg('name');
        }
    });

    tickets.addEventListener('input', function () {
        const value = parseInt(this.value);
        if (!validate_required(this.value)) {
            show_error_msg('tickets', 'Number of tickets is required');
        } else if (isNaN(value) || value < 1 || value > 10) {
            show_error_msg('tickets', 'Tickets must be between 1 and 10');
        } else {
            hide_error_msg('tickets');
        }
    });

    card_no.addEventListener('input', function () {
        const cardPattern = /^[0-9]{16}$/;
        if (this.value && !cardPattern.test(this.value.replace(/\s/g, ''))) {
            show_error_msg('cardNumber', 'Please enter a 16 digit card number');
        } else {
            hide_error_msg('cardNumber');
        }
    });

    expiry.addEventListener('input', function () {
        const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (this.value && !expiryPattern.test(this.value)) {
            show_error_msg('expiry', 'Please enter expiry in MM/YY');
        } else {
            hide_error_msg('expiry');
        }
    });

    cvv.addEventListener('input', function () {
        const cvvPattern = /^[0-9]{3}$/;
        if (this.value && !cvvPattern.test(this.value)) {
            show_error_msg('cvv', 'Please enter a valid 3 digit CVV');
        } else {
            hide_error_msg('cvv');
        }
    });

    upiid.addEventListener('input', function () {
        const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (this.value && !upiPattern.test(this.value)) {
            show_error_msg('upiId', 'Please enter a valid UPI ID');
        } else {
            hide_error_msg('upiId');
        }
    });

    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(name_field.value) || name_field.value.length < 2) {
            show_error_msg('name', 'Name must be at least 2 characters');
            isValid = false;
        }

        const tickets = parseInt(tickets.value);
        if (!validate_required(tickets.value) || isNaN(tickets) || tickets < 1 || tickets > 10) {
            show_error_msg('tickets', 'Tickets must be between 1 and 10');
            isValid = false;
        }

        // Validate payment method (either card details or UPI)
        const hasCardDetails = card_no.value || expiry.value || cvv.value;
        const hasUPI = upiid.value;

        if (!hasCardDetails && !hasUPI) {
            show_error_msg('cardNumber', 'Please provide either card details or UPI ID');
            isValid = false;
        } else if (hasCardDetails) {
            const cardPattern = /^[0-9]{16}$/;
            const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
            const cvvPattern = /^[0-9]{3,4}$/;

            if (!cardPattern.test(card_no.value.replace(/\s/g, ''))) {
                show_error_msg('cardNumber', 'Please enter a valid 16-digit card number');
                isValid = false;
            }
            if (!expiryPattern.test(expiry.value)) {
                show_error_msg('expiry', 'Please enter expiry in MM/YY format');
                isValid = false;
            }
            if (!cvvPattern.test(cvv.value)) {
                show_error_msg('cvv', 'Please enter a valid 3 or 4 digit CVV');
                isValid = false;
            }
        } else if (hasUPI) {
            const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
            if (!upiPattern.test(upiid.value)) {
                show_error_msg('upiId', 'Please enter a valid UPI ID');
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});