// Admin dashboard search validation
document.addEventListener('DOMContentLoaded', function () {

    function validateSearchField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function () {
                if (this.value.length > 0 && this.value.length < 2) {
                    show_error_msg(fieldId, 'Search term must be at least 2 characters');
                } else {
                    hide_error_msg(fieldId);
                }
            });
        }
    }

    validateSearchField('user-search');
    validateSearchField('event-search');
    validateSearchField('organizer-search');
});