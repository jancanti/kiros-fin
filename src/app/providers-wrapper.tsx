'use client';

import dynamic from 'next/dynamic';

// dynamic with ssr:false must be inside a Client Component (not layout.tsx Server Component)
const ClientRoot = dynamic(
  () => import('./client-root').then((m) => ({ default: m.ClientRoot })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f17]">
        <div className="w-8 h-8 border-[3px] border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return <ClientRoot>{children}</ClientRoot>;
}
