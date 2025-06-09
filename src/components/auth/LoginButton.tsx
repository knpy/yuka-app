'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';

export default function LoginButton() {
  const { signOut, user } = useAuthenticator((context) => [context.user]);
  const [userInfo, setUserInfo] = React.useState<any>(null);

  // ログイン時にユーザー情報を取得
  React.useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        const payload = session.tokens.idToken.payload;
        setUserInfo({
          email: payload.email,
          name: payload.name,
          provider: 'Google OAuth',
          username: payload['cognito:username']
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleLogin = async () => {
    try {
      console.log('Login button clicked - attempting signInWithRedirect');
      console.log('Current domain:', window.location.hostname);
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  if (user) {
    return (
      <div className="space-y-4">
        <div className="bg-green-100 p-4 rounded-lg border border-green-300">
          <h3 className="text-lg font-bold text-green-800 mb-2">✅ ログイン成功！</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>ユーザーID:</strong> {user.userId}</p>
            <p><strong>メールアドレス:</strong> {userInfo?.email || 'N/A'}</p>
            <p><strong>認証プロバイダー:</strong> {userInfo?.provider || 'N/A'}</p>
            {userInfo?.name && (
              <p><strong>名前:</strong> {userInfo.name}</p>
            )}
            <p><strong>Username:</strong> {userInfo?.username || user.username}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ログアウト
        </button>
      </div>
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