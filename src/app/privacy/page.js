export default function PrivacyPage() {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'white' }}>Privacy Policy</h1>
      <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>Last updated: June 2026</p>
        
        <h2>1. Information We Collect</h2>
        <p>At Arcade Room Gaming, we collect information that you provide directly to us when you create an account, such as your username, email address, and phone number.</p>
        
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate and improve our platform, to securely authenticate you, and to communicate with you about updates and new features.</p>
        
        <h2>3. Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information. We utilize Firebase Authentication for secure sign-ins and data management.</p>

        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact Resengal Studio.</p>
      </div>
    </div>
  );
}
