import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function SecretAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-50)] via-[var(--neutral-50)] to-[var(--accent-cream)]">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[var(--primary-800)]">
          ✨ Renato Tools
        </Link>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <SignedOut>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--neutral-800)] mb-6">
              🔐 Área Secreta de Admin
            </h1>
            <SignIn 
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'shadow-2xl rounded-2xl',
                },
              }}
              afterSignInUrl="/tools"
            />
          </div>
        </SignedOut>

        <SignedIn>
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">
              ✅ Autenticado!
            </h2>
            <p className="text-[var(--neutral-600)] mb-6">
              Você está logado como administrador.
            </p>
            <Link 
              href="/tools"
              className="inline-block bg-[var(--primary-500)] text-[var(--neutral-900)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--primary-600)] transition-colors"
            >
              Ir para o Board →
            </Link>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
