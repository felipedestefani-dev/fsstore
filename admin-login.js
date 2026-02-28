// Login da área administrativa
(function () {
  var AUTH_KEY = 'swaggang_admin_auth';
  var AUTH_USER_KEY = 'swaggang_admin_user';

  // Demo (front-end). Para segurança real, precisa de backend.
  var ADMIN_USER = 'Henrique';
  var ADMIN_PASS = 'Henrique11';

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === '1';
  }

  if (isAuthed()) {
    window.location.replace('admin.html');
    return;
  }

  var form = document.getElementById('admin-login-form');
  var userInput = document.getElementById('admin-user');
  var passInput = document.getElementById('admin-pass');
  var errorEl = document.getElementById('admin-login-error');

  function setError(visible) {
    if (!errorEl) return;
    errorEl.hidden = !visible;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setError(false);

      var user = (userInput ? userInput.value : '').trim();
      var pass = passInput ? passInput.value : '';

      if (user.toLowerCase() === ADMIN_USER.toLowerCase() && pass === ADMIN_PASS) {
        localStorage.setItem(AUTH_KEY, '1');
        localStorage.setItem(AUTH_USER_KEY, user);
        window.location.replace('admin.html');
        return;
      }

      setError(true);
      if (passInput) passInput.focus();
    });
  }
})();

