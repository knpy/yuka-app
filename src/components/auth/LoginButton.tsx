'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { signInWithRedirect } from 'aws-amplify/auth';

export default function LoginButton() {
  const { signOut, user } = useAuthenticator((context) => [context.user]);

  
  const handleLogin = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  if (user) {
    return (
      <button
        onClick={signOut}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Googleでログイン
    </button>
  );
}