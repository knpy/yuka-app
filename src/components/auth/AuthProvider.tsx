'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from '../../amplifyconfiguration.json';

// 型安全のためのAmplify設定
const config = {
  Auth: {
    Cognito: {
      userPoolId: amplifyconfig.Auth.Cognito.userPoolId,
      userPoolClientId: amplifyconfig.Auth.Cognito.userPoolClientId,
      identityPoolId: amplifyconfig.Auth.Cognito.identityPoolId,
      loginWith: {
        oauth: {
          domain: amplifyconfig.Auth.Cognito.loginWith.oauth.domain,
          scopes: amplifyconfig.Auth.Cognito.loginWith.oauth.scopes,
          redirectSignIn: amplifyconfig.Auth.Cognito.loginWith.oauth.redirectSignIn,
          redirectSignOut: amplifyconfig.Auth.Cognito.loginWith.oauth.redirectSignOut,
          responseType: "code" as const
        }
      }
    }
  }
};

Amplify.configure(config);

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