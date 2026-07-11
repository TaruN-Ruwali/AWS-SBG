const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Contact form endpoint — no DB, just validates and echoes success.
// Hook this up later to Resend/Nodemailer/EmailJS/Formspree if you want real emails.
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email and message are required.' });
  }

  // TODO: send email here (e.g. via Nodemailer transporter or a service API)
  console.log('New contact submission:', { name, email, subject, message });

  return res.json({ ok: true, message: 'Message received! We typically respond within 1-2 business days.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AWS SBG site running at http://localhost:${PORT}`));