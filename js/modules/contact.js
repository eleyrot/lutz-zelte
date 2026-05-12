/* ==========================================================================
   contact.js — Lutz Zelte GmbH
   Zweck: Client-seitige Formular-Validierung für das Kontaktformular.
   ========================================================================== */

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateForm(form)) showSuccess(form);
  });

  form.querySelectorAll('.form__input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      showError(field, 'Dieses Feld ist erforderlich.');
      valid = false;
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
      showError(field, 'Bitte gib eine gültige E-Mail-Adresse ein.');
      valid = false;
    }
  });
  return valid;
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function showError(input, message) {
  clearError(input);
  input.classList.add('is-invalid');
  const err = document.createElement('span');
  err.className = 'form__error';
  err.textContent = message;
  input.closest('.form__group')?.appendChild(err);
}

function clearError(input) {
  input.classList.remove('is-invalid');
  input.closest('.form__group')?.querySelector('.form__error')?.remove();
}

function showSuccess(form) {
  form.innerHTML = `
    <div style="text-align:center; padding: var(--space-6);">
      <p style="font-family:var(--font-heading);font-size:var(--text-2xl);font-weight:800;color:var(--color-dark);">Vielen Dank!</p>
      <p style="color:var(--color-gray);margin-top:var(--space-2);">Wir melden uns so schnell wie möglich bei dir.</p>
    </div>`;
}
