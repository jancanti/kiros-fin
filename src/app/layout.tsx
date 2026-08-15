import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ProvidersWrapper } from './providers-wrapper';

export const metadata: Metadata = {
  title: 'KirosFin - Controle Financeiro Pessoal',
  description:
    'Aplicativo moderno de gestão financeira pessoal, cartões de crédito e metas.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0b0f17',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased selection:bg-sky-500 selection:text-white"
        suppressHydrationWarning
      >
        {/*
          ProvidersWrapper is a Client Component that loads ClientRoot with ssr:false.
          This prevents @supabase/ssr createBrowserClient from running during
          static prerendering at build time (Vercel build).
        */}
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
