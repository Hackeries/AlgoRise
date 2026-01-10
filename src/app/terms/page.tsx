export default function TermsPage() {
  return (
    <main className='max-w-3xl mx-auto py-12 px-6 text-muted-foreground'>
      <h1 className='text-3xl font-semibold mb-6 text-foreground'>
        Terms of Service
      </h1>
      <p className='mb-4'>
        Welcome to AlgoRise! By using our platform, you agree to the following
        terms and conditions.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        1. Use of Service
      </h2>
      <p className='mb-4'>
        You agree to use our platform only for lawful purposes and in a way that
        does not infringe the rights of others or restrict their use.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        2. Accounts
      </h2>
      <p className='mb-4'>
        You are responsible for maintaining the confidentiality of your account
        and for all activities that occur under it.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        3. Limitation of Liability
      </h2>
      <p className='mb-4'>
        We are not liable for any indirect or consequential damages arising from
        your use of the platform.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        4. Changes to Terms
      </h2>
      <p className='mb-4'>
        We may update these terms occasionally. Continued use of the platform
        means you accept any revised terms.
      </p>

      <h2 className='text-xl font-semibold mt-8 mb-3 text-foreground'>
        5. Contact
      </h2>
      <p>
        For any questions, contact us at{' '}
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
