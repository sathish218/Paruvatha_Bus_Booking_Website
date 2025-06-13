const form = document.getElementById('authForm');
const toggle = document.getElementById('toggleForm');
const nameField = document.getElementById('name');
const phoneField = document.getElementById('phoneNumber');
const title = document.getElementById('form-title');
const responseMsg = document.getElementById('responseMsg');

let isLogin = true;

toggle.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;

  if (isLogin) {
    title.innerText = 'Login';
    nameField.style.display = 'none';
    nameField.removeAttribute('required');
    phoneField.style.display = 'none';
    phoneField.removeAttribute('required');
    form.querySelector('button').innerText = 'Login';
    toggle.innerHTML = `Don't have an account? <a href="#">Sign up</a>`;
  } else {
    title.innerText = 'Sign Up';
    nameField.style.display = 'block';
    nameField.setAttribute('required', true);
    phoneField.style.display = 'block';
    phoneField.setAttribute('required', true);
    form.querySelector('button').innerText = 'Sign Up';
    toggle.innerHTML = `Already have an account? <a href="#">Login</a>`;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  responseMsg.innerText = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isLogin) {
    // LOGIN
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        responseMsg.style.color = 'green';
        responseMsg.innerText = 'Login successful!';
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        responseMsg.style.color = 'red';
        responseMsg.innerText = typeof data === 'string' ? data : 'Invalid login';
      }
    } catch (error) {
      responseMsg.style.color = 'red';
      responseMsg.innerText = 'Server error. Please try again later.';
    }

  } else {
    // SIGNUP
    const name = document.getElementById('name').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber, email, password }) // password key corrected
      });

      const text = await response.text();
      responseMsg.style.color = response.ok ? 'green' : 'red';
      responseMsg.innerText = text;
    } catch (error) {
      responseMsg.style.color = 'red';
      responseMsg.innerText = 'Server error. Please try again later.';
    }
  }
});
