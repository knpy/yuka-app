'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';

export default function LoginButton() {
  const { signOut, user } = useAuthenticator((context) => [context.user]);
  
  if (user) {
    return (
      <button
        onClick={signOut}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        ログアウト
      </button>
    );
  }
  
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled
    >
      Googleでログイン
    </button>
  );
}