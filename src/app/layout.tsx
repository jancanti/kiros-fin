import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceDataProvider } from '@/contexts/FinanceDataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'KirosFin - Controle Financeiro Pessoal',
  description: 'Aplicativo moderno de gestão financeira pessoal, cartões de crédito e metas.',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased selection:bg-sky-500 selection:text-white" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <FinanceDataProvider>
              <AppLayout>{children}</AppLayout>
            </FinanceDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
