document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('authToken');

  // 1. Protéger la page : si pas de token, rediriger vers la page de connexion
  if (!token) {
    console.error('Aucun token trouvé. Redirection vers la page de connexion.');
    window.location.href = 'auth-login-basic.html';
    return;
  }

  // 2. Appeler l'API /me pour récupérer les informations de l'utilisateur
  fetch('http://192.168.100.175:8001/api-v1/user/auth/me/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else if (response.status === 401 || response.status === 403) {
      // Si le token est invalide ou expiré, supprimer le token et rediriger
      localStorage.removeItem('authToken');
      window.location.href = 'auth-login-basic.html';
    } else {
      return response.json().then(err => { throw new Error(JSON.stringify(err)) });
    }
  })
  .then(user => {
    if (user) {
      // 3. Mettre à jour la navbar avec les informations de l'utilisateur
      // Stocker les informations de l'utilisateur dans sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));

      const userNameElement = document.getElementById('user-dropdown-name');
      const userRoleElement = document.getElementById('user-dropdown-role');

      if (userNameElement) {
        userNameElement.textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      if (userRoleElement) {
        userRoleElement.textContent = user.is_superuser ? 'Admin' : 'Utilisateur';
      }
    }
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
  });

  // 4. Gérer la déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function (event) {
      event.preventDefault();
      localStorage.removeItem('authToken');
      window.location.href = 'auth-login-basic.html';
    });
  }
});