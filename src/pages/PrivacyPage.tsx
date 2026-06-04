import { LegalDocumentLayout } from '../components/legal/LegalDocumentLayout'

export function PrivacyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy" lastUpdated="June 3, 2026">
      <p>
        This Privacy Policy describes how Calma (&quot;Calma,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;) collects, uses, discloses, and protects personal information when you access
        our website, mobile experiences, live studio sessions, Audio Sanctuary protocols, and related
        services (collectively, the &quot;Services&quot;). By using the Services, you acknowledge this
        Policy and our Terms of Service.
      </p>

      <h2>1. Data Controller</h2>
      <p>
        For purposes of applicable privacy laws, including the EU General Data Protection Regulation
        (GDPR) and UK GDPR, Calma acts as the data controller for personal information processed
        through the Services. Contact:{' '}
        <a href="mailto:legal@calma.bg">legal@calma.bg</a>.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Account and profile data:</strong> name, email address, authentication identifiers,
          profile photo, and preferences you provide during registration or in your dashboard.
        </li>
        <li>
          <strong>Transaction data:</strong> purchase history, entitlement records, and payment
          references processed by Stripe. We do not store full payment card numbers on our servers.
        </li>
        <li>
          <strong>Usage and technical data:</strong> device type, browser, IP address, session logs,
          playback events, listen streaks, and security telemetry required to deliver spatial audio
          and prevent fraud.
        </li>
        <li>
          <strong>Communications:</strong> messages you send to support, waitlist sign-ups, and
          marketing opt-ins where permitted by law.
        </li>
        <li>
          <strong>Cookies and similar technologies:</strong> essential cookies for authentication,
          security, and analytics as described in Section 8.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Services, including secure HLS audio delivery;</li>
        <li>Authenticate users and enforce access to live sessions and sanctuary protocols;</li>
        <li>Process payments and fulfill purchases through Stripe;</li>
        <li>Send service-related notices, security alerts, and transactional emails;</li>
        <li>Analyze aggregated usage to optimize performance and product experience;</li>
        <li>Comply with legal obligations and protect our rights, users, and infrastructure.</li>
      </ul>

      <h2>4. Legal Bases for Processing (EEA/UK)</h2>
      <p>Where GDPR applies, we rely on:</p>
      <ul>
        <li>
          <strong>Contract:</strong> processing necessary to deliver the Services you request;
        </li>
        <li>
          <strong>Legitimate interests:</strong> security, fraud prevention, analytics, and product
          improvement, balanced against your rights;
        </li>
        <li>
          <strong>Consent:</strong> where required for non-essential cookies or marketing;
        </li>
        <li>
          <strong>Legal obligation:</strong> tax, accounting, and regulatory compliance.
        </li>
      </ul>

      <h2>5. Service Providers and International Transfers</h2>
      <p>
        We use trusted processors that may process data in the United States and other countries,
        including:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication, database, storage, and edge functions;
        </li>
        <li>
          <strong>Stripe</strong> — payment processing and billing portal;
        </li>
        <li>
          <strong>Mux</strong> — live streaming infrastructure where applicable;
        </li>
        <li>
          <strong>Vercel</strong> — application hosting and delivery.
        </li>
      </ul>
      <p>
        When we transfer personal data internationally, we implement appropriate safeguards such as
        Standard Contractual Clauses or equivalent mechanisms where required by law.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal information only as long as necessary for the purposes described in this
        Policy, including account lifecycle, legal retention periods, dispute resolution, and
        enforcement of agreements. You may request deletion subject to exceptions under applicable
        law.
      </p>

      <h2>7. Your Privacy Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, restrict,
        object to processing, port data, and withdraw consent. California residents may have
        additional rights under the CCPA/CPRA. To exercise rights, contact{' '}
        <a href="mailto:legal@calma.bg">legal@calma.bg</a>. We will verify requests as permitted by
        law.
      </p>

      <h2 id="cookies">8. Cookies and Tracking</h2>
      <p>
        We use essential cookies for login sessions, security, and checkout integrity. With your
        consent, we may use analytics cookies to understand how the Sanctuary and studio features are
        used. You can accept or manage preferences via our cookie banner. Browser controls may also
        limit certain cookies; disabling essential cookies may impair core functionality.
      </p>

      <h2>9. Security</h2>
      <p>
        We implement administrative, technical, and organizational measures appropriate to the
        sensitivity of the data, including encryption in transit, access controls, and signed media
        URLs. No method of transmission over the Internet is 100% secure.
      </p>

      <h2>10. Children</h2>
      <p>
        The Services are not directed to individuals under 16 (or the minimum age in your
        jurisdiction). We do not knowingly collect personal information from children. Contact us if
        you believe a child has provided data.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be posted on this
        page with an updated &quot;Last updated&quot; date. Continued use after changes constitutes
        notice of the revised Policy where permitted by law.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about this Privacy Policy:{' '}
        <a href="mailto:legal@calma.bg">legal@calma.bg</a> or{' '}
        <a href="mailto:hello@calma.bg">hello@calma.bg</a>.
      </p>
    </LegalDocumentLayout>
  )
}
