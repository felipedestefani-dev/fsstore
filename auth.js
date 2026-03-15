// Autenticação — funções compartilhadas (login e criar-conta)
(function () {
  var USERS_KEY = 'progresso_usuarios';
  var CURRENT_USER_KEY = 'progresso_current_user';

  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  function setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, (email || '').toLowerCase().trim());
  }

  function hashPassword(pwd) {
    return Promise.resolve().then(function () {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        var enc = new TextEncoder().encode(pwd);
        return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
          var arr = new Uint8Array(buf);
          var hex = '';
          for (var i = 0; i < arr.length; i++) {
            hex += ('0' + arr[i].toString(16)).slice(-2);
          }
          return hex;
        });
      }
      return btoa(encodeURIComponent(pwd));
    });
  }

  function login(email, senha) {
    var em = (email || '').toLowerCase().trim();
    return hashPassword(senha).then(function (hash) {
      var users = getUsers();
      var u = users.find(function (x) { return x.email === em; });
      if (!u || u.hash !== hash) return false;
      setCurrentUser(em);
      return true;
    });
  }

  function register(email, senha) {
    var em = (email || '').toLowerCase().trim();
    var users = getUsers();
    if (users.some(function (x) { return x.email === em; })) return Promise.resolve(false);
    return hashPassword(senha).then(function (hash) {
      users.push({ email: em, hash: hash });
      saveUsers(users);
      setCurrentUser(em);
      return true;
    });
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  window.getCurrentUser = getCurrentUser;
  window.login = login;
  window.register = register;
  window.clearCurrentUser = clearCurrentUser;
})();
