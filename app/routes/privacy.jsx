export default function Privacy() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px", fontFamily: "sans-serif", lineHeight: 1.7, color: "#111" }}>
      <h1>Privacy Policy — QuoteSnap</h1>
      <p><em>Last updated: April 2026</em></p>

      <h2>1. Introduction</h2>
      <p>QuoteSnap ("we", "our", "the app") is a Shopify app that allows merchants to hide product prices and collect quote requests from their customers. This Privacy Policy explains how we collect, use, and protect data when you install and use QuoteSnap.</p>

      <h2>2. Data We Collect</h2>
      <p>When a merchant installs QuoteSnap, we collect and store:</p>
      <ul>
        <li>Your Shopify store domain and access token (required to operate the app)</li>
        <li>Quote request submissions from your storefront customers, including: name, email, company, phone, and message</li>
        <li>App configuration settings (rules, customisation preferences)</li>
      </ul>

      <h2>3. How We Use Data</h2>
      <p>We use the data solely to provide the QuoteSnap service:</p>
      <ul>
        <li>Displaying quote request forms on your storefront</li>
        <li>Storing and displaying quote requests in your admin inbox</li>
        <li>Sending email notifications when new quotes are received</li>
        <li>Enforcing your subscription plan limits</li>
      </ul>
      <p>We do not sell, rent, or share your data or your customers' data with third parties for marketing purposes.</p>

      <h2>4. Data Storage</h2>
      <p>Data is stored in a secure PostgreSQL database hosted on Railway (railway.app). All data is stored in the European Union.</p>

      <h2>5. Data Retention</h2>
      <p>We retain your data for as long as you have the app installed. When you uninstall QuoteSnap, your store data and all associated quote requests are permanently deleted within 48 hours.</p>

      <h2>6. Customer Data (GDPR)</h2>
      <p>As a merchant, you are the data controller for your customers' personal information collected via quote forms. You are responsible for your own privacy policy regarding how you use that data. We act as a data processor on your behalf.</p>
      <p>We support Shopify's mandatory GDPR webhooks:</p>
      <ul>
        <li><strong>Customer data request:</strong> We will provide all stored data for a customer upon request.</li>
        <li><strong>Customer data erasure:</strong> We will delete all stored data for a customer upon request.</li>
        <li><strong>Shop data erasure:</strong> We will delete all store data within 48 hours of an uninstall.</li>
      </ul>

      <h2>7. Third-Party Services</h2>
      <p>We use Brevo (brevo.com) to send transactional email notifications on behalf of merchants. Brevo processes email addresses only for delivery purposes.</p>

      <h2>8. Security</h2>
      <p>We use industry-standard security practices including HTTPS encryption for all data in transit and encrypted storage for sensitive credentials.</p>

      <h2>9. Contact</h2>
      <p>If you have questions about this Privacy Policy or wish to make a data request, please contact us at: <a href="mailto:support@quotesnap.app">support@quotesnap.app</a></p>
    </div>
  );
}
