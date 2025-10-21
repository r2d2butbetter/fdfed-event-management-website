//common funcs i neeed for validation

function show_error_msg(fieldId, message) {
    let errorElement = document.getElementById(fieldId + '-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = fieldId + '-error';
        errorElement.className = 'field-error';
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        const field = document.getElementById(fieldId);
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hide_error_msg(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function validate_email(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function validate_required(value) {
    return value && value.trim().length > 0;
}