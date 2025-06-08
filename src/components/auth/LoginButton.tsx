'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';

export default function LoginButton() {
  const { signIn } = useAuthenticator((context) => [context.user]);
  
  return (
    <button
      onClick={signIn}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Googleでログイン
    </button>
  );
}