document.getElementById('footer-placeholder').innerHTML = `
  <div class="footer-grid">
    <div>
      <div class="brand" style="margin-bottom:14px;">
        <img src="assets/images/logo.png" alt="Logo" class="logo-main" style="width:34px;">
        <div class="brand-text">
          <div class="name">AWS STUDENT BUILDER GROUP</div>
          <div class="sub">at Graphic Era Hill University — Bhimtal Campus</div>
        </div>
      </div>
      <p style="opacity:.8; font-size:14px; max-width:320px;">Turning students into cloud-native engineers, one project at a time — from the heart of the Himalayas.</p>
    </div>
    <div>
      <h4>Navigate</h4>
      <ul>
        <li><a href="about.html">About</a></li>
        <li><a href="events.html">Events</a></li>
        <li><a href="team.html">Team</a></li>
        <li><a href="gallery.html">Gallery</a></li>
      </ul>
    </div>
    <div>
      <h4>Community</h4>
      <ul>
        <li><a href="contact.html">Contact Us</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="#">Builder Portal</a></li>
      </ul>
    </div>
    <div>
      <h4>Connect</h4>
      <ul>
        <li><a href="mailto:awssbggehu@gmail.com">Email Us</a></li>
        <li><a href="#">LinkedIn</a></li>
        <li><a href="https://www.instagram.com/awssbggehu?igsh=OHYweTU1bWVvejM=">Instagram</a></li>
      
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p style="margin-bottom: 8px;">Graphic Era Hill University, Bhimtal Campus, Nainital, Uttarakhand</p>
    <p style="margin-bottom: 12px; font-size: 13px;">
      <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Privacy Policy</a> &nbsp;&nbsp;|&nbsp;&nbsp; 
      <a href="https://aws.amazon.com/events/terms/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Terms & Conditions</a>
    </p>
    © ${new Date().getFullYear()} AWS Student Builder Group — Graphic Era Hill University. Built by student builders.
  </div>
`;