import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-50)] via-[var(--neutral-50)] to-[var(--accent-cream)] flex items-center justify-center p-4">
      <SignUp 
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
