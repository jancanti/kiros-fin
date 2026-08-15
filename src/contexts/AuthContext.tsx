'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/finance';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  setDemoMode: (isDemo: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isDemo: false,
  setDemoMode: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check demo mode from localStorage
    const savedDemo = localStorage.getItem('kiros_demo_mode');
    if (savedDemo === 'true') {
      setIsDemo(true);
      setUser({
        id: 'demo-user-123',
        email: 'demo@kirosfin.app',
        app_metadata: {},
        user_metadata: { full_name: 'Usuário Demonstração' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setProfile({
        id: 'demo-user-123',
        email: 'demo@kirosfin.app',
        full_name: 'Usuário Demonstração',
        currency: 'BRL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    // Supabase auth subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleSetDemoMode = (val: boolean) => {
    setIsDemo(val);
    if (val) {
      localStorage.setItem('kiros_demo_mode', 'true');
      setUser({
        id: 'demo-user-123',
        email: 'demo@kirosfin.app',
        app_metadata: {},
        user_metadata: { full_name: 'Usuário Demonstração' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setProfile({
        id: 'demo-user-123',
        email: 'demo@kirosfin.app',
        full_name: 'Usuário Demonstração',
        currency: 'BRL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.removeItem('kiros_demo_mode');
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemo) {
      handleSetDemoMode(false);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemo,
        setDemoMode: handleSetDemoMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
