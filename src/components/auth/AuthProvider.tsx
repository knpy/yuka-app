'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from '../../amplifyconfiguration.json';

Amplify.configure(amplifyconfig);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}