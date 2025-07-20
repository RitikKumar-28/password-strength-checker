const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('strength-bar');
const feedback = document.getElementById('feedback');
const togglePassword = document.getElementById('toggle-password');

const strengthIcons = [
  '❌', // Too short
  '⚠️', // Weak
  '🔶', // Moderate
  '✅', // Strong
  '💪'  // Very Strong
];

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const strength = checkStrength(password);

  // Remove previous strength classes (no longer used)
  // strengthBar.classList.remove('strength-0', 'strength-1', 'strength-2', 'strength-3', 'strength-4');
  // Do not add strength classes anymore

  // Set inline styles for ::before pseudo-element
  const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];
  const colors = ['#ccc', '#ff4d4d', '#ff944d', '#ffdb4d', '#a3d977', '#4caf50'];
  strengthBar.style.setProperty('--before-width', widths[strength.score] || '0%');
  strengthBar.style.setProperty('--before-bg', colors[strength.score] || 'transparent');

  feedback.innerHTML = `<span class="icon">${strengthIcons[strength.score > 0 ? strength.score - 1 : 0]}</span> ${strength.message}`;

  // Update checklist items
  document.getElementById('len').classList.toggle('valid', /.{8,}/.test(password));
  document.getElementById('upper').classList.toggle('valid', /[A-Z]/.test(password));
  document.getElementById('lower').classList.toggle('valid', /[a-z]/.test(password));
  document.getElementById('num').classList.toggle('valid', /[0-9]/.test(password));
  document.getElementById('sym').classList.toggle('valid', /[^A-Za-z0-9]/.test(password));

  // Call backend API for entropy-based strength
  if (password.length > 0) {
    fetch('/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const entropyMessage = `Entropy: ${data.entropy} - ${data.message}`;
      feedback.innerHTML += `<br/><small>${entropyMessage}</small>`;
      console.log('Backend API response:', data);
    })
    .catch(error => {
      console.error('Error fetching strength from backend:', error);
    });
  }
});

togglePassword.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

function checkStrength(password) {
  let score = 0;
  let message = "";

  const regexes = [
    /.{8,}/,               // At least 8 characters
    /[a-z]/,               // Lowercase letter
    /[A-Z]/,               // Uppercase letter
    /[0-9]/,               // Digit
    /[^A-Za-z0-9]/         // Special character
  ];

  regexes.forEach(regex => {
    if (regex.test(password)) score++;
  });

  // Basic entropy-based message
  if (score === 0) message = "Too short";
  else if (score <= 2) message = "Weak";
  else if (score === 3) message = "Moderate";
  else if (score === 4) message = "Strong";
  else if (score === 5) message = "Very Strong";

  return { score, message };
}
