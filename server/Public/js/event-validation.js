document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const title = document.getElementById('title');
    const desc = document.getElementById('description');
    const venue = document.getElementById('venue');
    const capacity = document.getElementById('capacity');
    const price = document.getElementById('price');
    const start_date = document.getElementById('startdTime');
    const end_date = document.getElementById('enddTime');
    const img = document.getElementById('image');

    title.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('title', 'Event title is required');
        } else if (this.value.length < 3) {
            show_error_msg('title', 'Title must be at least 3 characters');
        } else {
            hide_error_msg('title');
        }
    });


    desc.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('description', 'Event description is required');
        } else if (this.value.length < 10) {
            show_error_msg('description', 'desc must be at least 10 characters');
        } else {
            hide_error_msg('description');
        }
    });


    venue.addEventListener('input', function () {
        if (!validate_required(this.value)) {
            show_error_msg('venue', 'Venue is required');
        } else if (this.value.length < 10) {
            show_error_msg('venue', 'Venue must be at least 10 characters');
        } else {
            hide_error_msg('venue');
        }
    });


    capacity.addEventListener('input', function () {
        const value = parseInt(this.value);
        if (!validate_required(this.value)) {
            show_error_msg('capacity', 'Capacity is required');
        } else if (isNaN(value) || value < 1 || value > 10000) {
            show_error_msg('capacity', 'Capacity must be between 1 and 10k');
        } else {
            hide_error_msg('capacity');
        }
    });

    price.addEventListener('input', function () {
        const value = parseFloat(this.value);
        if (!validate_required(this.value)) {
            show_error_msg('price', 'Price is required');
        } else if (isNaN(value) || value < 0) {
            show_error_msg('price', 'Price must be >0');
        } else {
            hide_error_msg('price');
        }
    });

    function validateDates() {
        const startd = new Date(start_date.value);
        const endd = new Date(end_date.value);
        const now = new Date();
        now.setSeconds(0, 0);

        if (!start_date.value) {
            show_error_msg('startdTime', 'Start date is required');
            return false;
        }

        if (startd < now) {
            show_error_msg('startdTime', 'event must start in the future');
            return false;
        }

        if (!end_date.value) {
            show_error_msg('enddTime', 'End date is required');
            return false;
        }

        if (endd < now) {
            show_error_msg('enddTime', 'event must end in the future');
            return false;
        }

        if (endd <= startd) {
            show_error_msg('enddTime', 'End must be after start');
            return false;
        }

        hide_error_msg('startdTime');
        hide_error_msg('enddTime');
        return true;
    }

    start_date.addEventListener('change', validateDates);
    end_date.addEventListener('change', validateDates);

    img.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024;

            if (!allowedTypes.includes(file.type)) {
                show_error_msg('image', 'Please select a valid image file (JPEG, PNG, GIF)');
                this.value = '';
            } else if (file.size > maxSize) {
                show_error_msg('image', 'Image size must be less than 5MB');
                this.value = '';
            } else {
                hide_error_msg('image');
            }
        }
    });

    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validate_required(title.value) || title.value.length < 3) {
            show_error_msg('title', 'Title must be at least 3 characters');
            isValid = false;
        }

        if (!validate_required(desc.value) || desc.value.length < 10) {
            show_error_msg('description', 'Description must be at least 10 characters');
            isValid = false;
        }

        if (!validate_required(venue.value)) {
            show_error_msg('venue', 'Venue is required');
            isValid = false;
        }

        const capacityValue = parseInt(capacity.value);
        if (!validate_required(capacity.value) || isNaN(capacityValue) || capacityValue < 1 || capacityValue > 10000) {
            show_error_msg('capacity', 'Capacity must be between 1 and 10,000');
            isValid = false;
        }

        const priceValue = parseFloat(price.value);
        if (!validate_required(price.value) || isNaN(priceValue) || priceValue < 0) {
            show_error_msg('price', 'Price must be 0 or greater');
            isValid = false;
        }

        if (!validateDates()) {
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});