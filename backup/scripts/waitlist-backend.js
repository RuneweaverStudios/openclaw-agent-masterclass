// WAITLIST BACKEND - Google Sheets Integration
// Replace YOUR_GOOGLE_SCRIPT_URL with the URL from Step 3

document.getElementById('waitlistForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');

  // Validate email
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding to waitlist...';

  try {
    // ========================================
    // REPLACE THIS URL WITH YOUR GOOGLE SCRIPT URL
    // ========================================
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
    // ========================================

    // Submit to Google Sheets
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        source: 'waitlist',
        timestamp: new Date().toISOString()
      })
    });

    // Show success (we can't read the response with no-cors, so assume success)
    successMessage.classList.add('show');
    submitBtn.textContent = '✓ You\'re on the List!';
    submitBtn.style.background = '#22c55e';

    // Clear form
    document.getElementById('email').value = '';

    // Update counter (optimistic update)
    const countEl = document.getElementById('waitlistCount');
    const currentCount = parseInt(countEl.textContent);
    countEl.textContent = currentCount + 1;

    // Track conversion (analytics)
    console.log('Waitlist signup:', email, new Date().toISOString());

    // Optional: Send to analytics
    // gtag('event', 'waitlist_signup', { 'email': email });

  } catch (error) {
    console.error('Error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join Waitlist — It\'s Free';
    alert('Error joining waitlist. Please try again or email support@polysauce.xyz');
  }
});

// Load waitlist count (optional - from a public endpoint)
// For now, we'll just show a static number
