// WAITLIST BACKEND - Supabase Integration
// Uses Supabase REST API

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://YOUR_PROJECT.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // From Supabase dashboard

// ========================================
// WAITLIST FORM SUBMISSION
// ========================================
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
    // Submit to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        email: email,
        source: 'waitlist',
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join waitlist');
    }

    // Show success
    successMessage.classList.add('show');
    submitBtn.textContent = '✓ You\'re on the List!';
    submitBtn.style.background = '#22c55e';

    // Clear form
    document.getElementById('email').value = '';

    // Update counter (optimistic update)
    const countEl = document.getElementById('waitlistCount');
    const currentCount = parseInt(countEl.textContent);
    countEl.textContent = currentCount + 1;

    // Track conversion
    console.log('Waitlist signup:', email, new Date().toISOString());

  } catch (error) {
    console.error('Error:', error);

    // Check if duplicate email
    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      alert('This email is already on the waitlist!');
    } else {
      alert('Error joining waitlist. Please try again or email support@polysauce.xyz');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Join Waitlist — It\'s Free';
  }
});

// ========================================
// LOAD WAITLIST COUNT (Optional)
// ========================================
async function loadWaitlistCount() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (response.ok) {
      const count = response.headers.get('content-range').split('/')[1];
      document.getElementById('waitlistCount').textContent = count;
    }
  } catch (error) {
    console.log('Could not load waitlist count');
  }
}

// Load count on page load
loadWaitlistCount();
