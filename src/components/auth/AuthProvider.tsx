'use client';

import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from '../../amplifyconfiguration.json';

// 動的URL取得関数
function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/';
  }
  
  const origin = window.location.origin;
  console.log('Current origin:', origin);
  
  // ローカル開発環境
  if (origin.includes('localhost')) {
    return 'http://localhost:3000/';
  }
  
  // 環境変数からの固定URL（推奨）
  if (process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL) {
    console.log('Using env redirect URL:', process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL);
    return process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL;
  }
  
  // Amplifyの動的URL（フォールバック）
  return `${origin}/`;
}

// 設定を動的に生成する関数
function createAmplifyConfig() {
  const currentUrl = getCurrentUrl();
  
  return {
    Auth: {
      Cognito: {
        userPoolId: amplifyconfig.Auth.Cognito.userPoolId,
        userPoolClientId: amplifyconfig.Auth.Cognito.userPoolClientId,
        identityPoolId: amplifyconfig.Auth.Cognito.identityPoolId,
        loginWith: {
          oauth: {
            domain: amplifyconfig.Auth.Cognito.loginWith.oauth.domain,
            scopes: amplifyconfig.Auth.Cognito.loginWith.oauth.scopes,
            redirectSignIn: [currentUrl],
            redirectSignOut: [currentUrl],
            responseType: "code" as const
          }
        }
      }
    }
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 動的設定の適用
  React.useEffect(() => {
    const config = createAmplifyConfig();
    console.log('AuthProvider initialized');
    console.log('Dynamic Amplify config:', config);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Amplifyの設定を更新
    Amplify.configure(config);
  }, []);

  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}