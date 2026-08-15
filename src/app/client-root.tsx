'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceDataProvider } from '@/contexts/FinanceDataContext';
import { AppLayout } from '@/components/layout/AppLayout';

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceDataProvider>
          <AppLayout>{children}</AppLayout>
        </FinanceDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
