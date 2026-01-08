import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | AlgoRise',
  description:
    'Learn how AlgoRise collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - AlgoRise',
    description:
      'Learn how AlgoRise collects, uses, and protects your personal information.',
    type: 'website',
  },
}

export default function PrivacyPage() {
  const lastUpdated = 'January 8, 2025'

  return (
    <main className='max-w-4xl mx-auto py-12 px-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 text-foreground'>
          Privacy Policy
        </h1>
        <p className='text-sm text-muted-foreground'>
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className='prose prose-neutral dark:prose-invert max-w-none text-muted-foreground'>
        <p className='text-lg leading-relaxed mb-8'>
          At AlgoRise, we value your privacy and are committed to protecting
          your personal information. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use
          our platform.
        </p>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            1. Information We Collect
          </h2>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            1.1 Information You Provide
          </h3>
          <ul className='list-disc pl-6 space-y-2 mb-4'>
            <li>
              <strong>Account Information:</strong> When you register, we
              collect your email address, username, and password.
            </li>
            <li>
              <strong>Profile Information:</strong> Optional information like
              your college, company, status (student/professional), and social
              links.
            </li>
            <li>
              <strong>Platform Handles:</strong> Codeforces, AtCoder, LeetCode,
              and other competitive programming platform usernames you choose to
              link.
            </li>
            <li>
              <strong>Communication Data:</strong> Messages you send through our
              contact form or support channels.
            </li>
          </ul>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            1.2 Information Collected Automatically
          </h3>
          <ul className='list-disc pl-6 space-y-2 mb-4'>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, time
              spent on platform, problem attempts, and solving patterns.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, operating
              system, device identifiers, and IP address.
            </li>
            <li>
              <strong>Log Data:</strong> Access times, referring URLs, and
              interaction logs for debugging and analytics.
            </li>
          </ul>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            1.3 Information from Third Parties
          </h3>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>OAuth Providers:</strong> If you sign in with Google or
              GitHub, we receive your email and basic profile information.
            </li>
            <li>
              <strong>Competitive Programming Platforms:</strong> Public data
              from Codeforces, AtCoder, and similar platforms including ratings,
              submissions, and contest history.
            </li>
          </ul>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            2. How We Use Your Information
          </h2>
          <p className='mb-4'>We use the collected information to:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Provide and maintain our services</li>
            <li>
              Personalize your experience with adaptive problem recommendations
            </li>
            <li>Track your progress and generate analytics</li>
            <li>
              Enable group features and leaderboards with your consent
            </li>
            <li>Send important updates about your account and our services</li>
            <li>Improve our platform based on usage patterns</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            3. Cookies and Tracking Technologies
          </h2>
          <p className='mb-4'>
            We use cookies and similar tracking technologies to enhance your
            experience:
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            3.1 Essential Cookies
          </h3>
          <p className='mb-4'>
            Required for authentication, security, and core functionality.
            These cannot be disabled.
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            3.2 Analytics Cookies
          </h3>
          <p className='mb-4'>
            We use Google Analytics to understand how users interact with our
            platform. This helps us improve features and user experience. Google
            Analytics collects anonymized data about page visits, session
            duration, and user flow.
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            3.3 Advertising Cookies
          </h3>
          <p className='mb-4'>
            We use Google AdSense to display relevant advertisements on our
            platform. Google AdSense may use cookies to:
          </p>
          <ul className='list-disc pl-6 space-y-2 mb-4'>
            <li>
              Serve ads based on your prior visits to our website or other
              websites
            </li>
            <li>Track ad performance and frequency</li>
            <li>
              Provide personalized advertising (you can opt out through Google
              Ad Settings)
            </li>
          </ul>
          <p>
            For more information about how Google uses data, visit:{' '}
            <a
              href='https://policies.google.com/technologies/ads'
              className='text-primary hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Google Ads Policies
            </a>
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            4. Third-Party Services
          </h2>
          <p className='mb-4'>
            We integrate with third-party services to provide our features:
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            4.1 Google Analytics
          </h3>
          <p className='mb-4'>
            Used for website analytics. Google may collect information about
            your device and browsing activity. See{' '}
            <a
              href='https://policies.google.com/privacy'
              className='text-primary hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Google Privacy Policy
            </a>
            .
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            4.2 Google AdSense
          </h3>
          <p className='mb-4'>
            Used to display advertisements. Google AdSense uses cookies and web
            beacons to serve ads based on your interests and browsing history.
            You can manage your ad preferences at{' '}
            <a
              href='https://www.google.com/settings/ads'
              className='text-primary hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Google Ad Settings
            </a>
            .
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            4.3 Authentication Providers
          </h3>
          <p className='mb-4'>
            Google and GitHub OAuth for secure sign-in. These services have
            their own privacy policies governing how they handle your
            information.
          </p>

          <h3 className='text-lg font-medium mt-6 mb-3 text-foreground'>
            4.4 Payment Processors
          </h3>
          <p className='mb-4'>
            For premium features, we use Razorpay to process payments securely.
            Payment information is handled directly by Razorpay and is not
            stored on our servers.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            5. Data Security
          </h2>
          <p className='mb-4'>
            We implement appropriate technical and organizational measures to
            protect your personal information:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>All data is encrypted in transit using TLS/SSL</li>
            <li>Passwords are hashed using industry-standard algorithms</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls limiting employee access to personal data</li>
            <li>Secure cloud infrastructure with regular backups</li>
          </ul>
          <p className='mt-4'>
            While we strive to protect your information, no method of
            transmission over the Internet is 100% secure. We cannot guarantee
            absolute security.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            6. Data Sharing and Disclosure
          </h2>
          <p className='mb-4'>
            We do not sell your personal information. We may share your
            information in the following circumstances:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>With Your Consent:</strong> When you explicitly agree to
              share data (e.g., public profile, group leaderboards).
            </li>
            <li>
              <strong>Service Providers:</strong> Third parties who assist in
              operating our platform (hosting, analytics, payment processing).
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law,
              subpoena, or government request.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets.
            </li>
          </ul>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            7. Your Rights and Choices
          </h2>
          <p className='mb-4'>
            Depending on your location, you may have the following rights:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and
              associated data
            </li>
            <li>
              <strong>Portability:</strong> Receive your data in a portable
              format
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing
              communications
            </li>
            <li>
              <strong>Cookie Preferences:</strong> Manage cookie settings
              through your browser
            </li>
          </ul>
          <p className='mt-4'>
            To exercise these rights, contact us at{' '}
            <a
              href='mailto:support@myalgorise.in'
              className='text-primary hover:underline'
            >
              support@myalgorise.in
            </a>
            .
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            8. Data Retention
          </h2>
          <p className='mb-4'>
            We retain your personal information for as long as your account is
            active or as needed to provide services. Upon account deletion, we
            will delete your personal data within 30 days, except where we are
            required to retain it for legal or legitimate business purposes.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            9. Children's Privacy
          </h2>
          <p className='mb-4'>
            AlgoRise is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children under 13.
            If we become aware that a child under 13 has provided us with
            personal information, we will take steps to delete such information.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            10. International Data Transfers
          </h2>
          <p className='mb-4'>
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            to protect your information in accordance with this Privacy Policy.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            11. Changes to This Policy
          </h2>
          <p className='mb-4'>
            We may update this Privacy Policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page and updating the "Last updated" date. Your continued use of the
            platform after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className='mb-10'>
          <h2 className='text-xl font-semibold mt-8 mb-4 text-foreground'>
            12. Contact Us
          </h2>
          <p className='mb-4'>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <div className='bg-muted/50 p-4 rounded-lg'>
            <p className='mb-2'>
              <strong>Email:</strong>{' '}
              <a
                href='mailto:support@myalgorise.in'
                className='text-primary hover:underline'
              >
                support@myalgorise.in
              </a>
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <a
                href='https://www.myalgorise.in'
                className='text-primary hover:underline'
              >
                www.myalgorise.in
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* Footer Links */}
      <div className='mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground'>
        <Link href='/terms' className='text-primary hover:underline'>
          Terms of Service
        </Link>{' '}
        ·{' '}
        <Link href='/contact' className='text-primary hover:underline'>
          Contact Us
        </Link>{' '}
        ·{' '}
        <Link href='/faqs' className='text-primary hover:underline'>
          FAQs
        </Link>
      </div>
    </main>
  )
}
