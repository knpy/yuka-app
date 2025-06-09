'use client';

import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from '../../amplifyconfiguration.json';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

// 許可されたメールアドレスのリスト
const ALLOWED_EMAILS = [
  'taka.0717.ken@gmail.com', // あなたのメールアドレス
  // 必要に応じて追加
];

// 環境変数からも許可メールを読み込み（本番環境での設定用）
const ENV_ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',') || [];
const ALL_ALLOWED_EMAILS = [...ALLOWED_EMAILS, ...ENV_ALLOWED_EMAILS].filter(Boolean);

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
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  // メールアドレス認証チェック
  const checkEmailAuthorization = React.useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        const payload = session.tokens.idToken.payload;
        const email = payload.email as string;
        
        console.log('🔐 Email authorization check:', {
          email,
          allowed: ALL_ALLOWED_EMAILS,
          isAuthorized: ALL_ALLOWED_EMAILS.includes(email)
        });
        
        setUserEmail(email);
        
        if (ALL_ALLOWED_EMAILS.includes(email)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          // 許可されていないユーザーを自動ログアウト
          await signOut();
          alert(`アクセスが拒否されました。\n許可されていないメールアドレス: ${email}\n\nシステム管理者にお問い合わせください。`);
        }
      } else {
        setIsAuthorized(null);
        setUserEmail(null);
      }
    } catch (error) {
      console.error('Failed to check email authorization:', error);
      setIsAuthorized(null);
    }
  }, []);

  // 動的設定の適用
  React.useEffect(() => {
    const config = createAmplifyConfig();
    console.log('AuthProvider initialized');
    console.log('Dynamic Amplify config:', config);
    console.log('Allowed emails:', ALL_ALLOWED_EMAILS);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Amplifyの設定を更新
    Amplify.configure(config);
  }, []);

  // 認証状態変化を監視
  React.useEffect(() => {
    // 定期的にセッションをチェック
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken) {
          await checkEmailAuthorization();
        } else {
          setIsAuthorized(null);
          setUserEmail(null);
        }
      } catch (error) {
        setIsAuthorized(null);
        setUserEmail(null);
      }
    };

    checkAuth();
    
    // 5秒ごとにチェック（ログイン後の検証用）
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [checkEmailAuthorization]);

  // 許可されていないユーザーの場合の表示
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">🚫 アクセス拒否</h1>
            <p className="text-red-700 mb-4">
              申し訳ございませんが、このアプリケーションへのアクセス権限がありません。
            </p>
            <div className="bg-red-100 p-3 rounded border border-red-300 mb-4">
              <p className="text-sm text-red-600">
                <strong>ログイン試行メール:</strong> {userEmail}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              アクセスが必要な場合は、システム管理者にお問い合わせください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              再ログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}