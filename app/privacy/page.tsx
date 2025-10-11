export default function PrivacyPage() {
  return (
    <main className='max-w-3xl mx-auto py-12 px-6 text-muted-foreground'>
      <h1 className='text-3xl font-semibold mb-6 text-foreground'>
        Privacy Policy
      </h1>
      <p className='mb-4'>
        At AlgoRise, we value your privacy. This Privacy Policy explains how we
        collect, use, and protect your personal information when you use our
        platform.
      </p>
      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        1. Information We Collect
      </h2>
      <p className='mb-4'>
        We collect information you provide when you register, such as your
        email, username, and usage data like problem attempts and progress.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        2. How We Use Your Data
      </h2>
      <p className='mb-4'>
        We use your data to personalize your learning experience, track your
        progress, and improve our services.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        3. Data Protection
      </h2>
      <p className='mb-4'>
        We implement strong security measures to protect your data from
        unauthorized access, alteration, or destruction.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        4. Contact Us
      </h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at{' '}
        <a
          href='mailto:support@myalgorise.in'
          className='text-foreground hover:underline'
        >
          support@myalgorise.in
        </a>
        .
      </p>
    </main>
  );
}