import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-50)] via-[var(--neutral-50)] to-[var(--accent-cream)] flex items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-2xl rounded-2xl',
          },
        }}
      />
    </div>
  );
}
