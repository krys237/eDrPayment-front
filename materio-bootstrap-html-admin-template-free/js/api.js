document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formAuthentication');
  if (!form) return;

  // Logique pour la page d'enregistrement
  if (document.getElementById('terms-conditions')) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const firstName = document.getElementById('lastname').value; // Prénom
      const lastName = document.getElementById('firstname').value; // Nom
      const email = document.getElementById('email').value;
      const telephone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const terms = document.getElementById('terms-conditions').checked;

      if (!terms) {
        alert("Veuillez accepter les termes et politiques de confidentialité.");
        return;
      }

      const data = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        telephone: telephone,
        password: password
      };

      fetch('http://192.168.100.175:8001/api-v1/user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (response.ok) {
          window.location.href = 'auth-login-basic.html';
        } else {
          return response.json().then(err => { throw new Error(JSON.stringify(err)) });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de l\'enregistrement : ' + error.message);
      });
    });
  }

  // Logique pour la page de connexion
  // On vérifie un élément qui n'est que sur la page de login, par exemple le champ 'email-username'
  if (document.querySelector('[name="email-username"]')) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const emailOrPhone = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const data = {
        email: emailOrPhone,
        password: password
      };

      fetch('http://192.168.100.175:8001/api-v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(err => { throw new Error(JSON.stringify(err)) });
        }
      })
      .then(data => {
        const token = data.token || data.access;
        if (token) {
          // Sauvegarder le token dans le localStorage
          localStorage.setItem('authToken', token);
          window.location.href = 'index.html';
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Erreur de connexion : ' + error.message);
      });
    });
  }
});