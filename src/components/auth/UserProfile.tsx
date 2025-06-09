'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

export default function UserProfile() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [userAttributes, setUserAttributes] = React.useState<Record<string, any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sessionInfo, setSessionInfo] = React.useState<any>(null);

  // ユーザー属性を直接取得する関数
  const fetchAttributes = React.useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 デバッグ: ユーザー情報詳細');
      console.log('user object:', user);
      console.log('user.userId:', user.userId);
      console.log('user.username:', user.username);
      console.log('user.attributes:', user.attributes);
      console.log('user.signInDetails:', user.signInDetails);
      
      // まずセッション情報を取得（これは成功するはず）
      const session = await fetchAuthSession();
      console.log('🔑 セッション情報:', session);
      console.log('🎫 IDトークン:', session.tokens?.idToken);
      console.log('🎫 アクセストークン:', session.tokens?.accessToken);
      
      // IDトークンからクレーム情報を取得
      if (session.tokens?.idToken) {
        const payload = session.tokens.idToken.payload;
        console.log('🏷️ IDトークンのペイロード:', payload);
        setSessionInfo(payload);
      }

      // fetchUserAttributesは後で試す
      try {
        const attributes = await fetchUserAttributes();
        console.log('✅ fetchUserAttributes結果:', attributes);
        setUserAttributes(attributes);
      } catch (attributeError) {
        console.log('⚠️ fetchUserAttributes失敗（一時的にスキップ）:', attributeError);
        // IDトークンのペイロードから属性を使用
        if (session.tokens?.idToken) {
          const payload = session.tokens.idToken.payload;
          setUserAttributes({
            email: payload.email,
            name: payload.name,
            username: payload['cognito:username']
          });
        }
      }
    } catch (error) {
      console.error('❌ fetchUserAttributes エラー:', error);
      console.error('エラー詳細:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      fetchAttributes();
    }
  }, [user, fetchAttributes]);

  if (!user) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 max-w-2xl">
      <h2 className="text-xl font-bold text-blue-800 mb-4">👤 ユーザー詳細情報</h2>
      
      {/* 基本情報 */}
      <div className="mb-4">
        <h3 className="font-semibold text-blue-700 mb-2">基本情報</h3>
        <div className="bg-white p-3 rounded border text-sm space-y-1">
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          <p><strong>Login ID:</strong> {user.signInDetails?.loginId || 'N/A'}</p>
        </div>
      </div>

      {/* 認証情報 */}
      <div className="mb-4">
        <h3 className="font-semibold text-blue-700 mb-2">認証情報</h3>
        <div className="bg-white p-3 rounded border text-sm space-y-1">
          <p><strong>Auth Flow:</strong> {user.signInDetails?.authFlowType || 'N/A'}</p>
          <p><strong>Provider:</strong> Google OAuth</p>
        </div>
      </div>

      {/* 属性情報 */}
      <div className="mb-4">
        <h3 className="font-semibold text-blue-700 mb-2">Google 連携情報</h3>
        <div className="bg-white p-3 rounded border text-sm space-y-1">
          {loading ? (
            <p>属性情報を取得中...</p>
          ) : userAttributes ? (
            Object.entries(userAttributes).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))
          ) : (
            <p>属性情報が取得できませんでした</p>
          )}
          <button 
            onClick={fetchAttributes}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? '取得中...' : '属性を再取得'}
          </button>
        </div>
      </div>

      {/* 従来のuser.attributes */}
      {user.attributes && Object.keys(user.attributes).length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-blue-700 mb-2">User.attributes (従来)</h3>
          <div className="bg-white p-3 rounded border text-sm space-y-1">
            {Object.entries(user.attributes).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* IDトークンペイロード */}
      {sessionInfo && (
        <div className="mb-4">
          <h3 className="font-semibold text-blue-700 mb-2">🎫 IDトークン情報</h3>
          <div className="bg-white p-3 rounded border text-sm space-y-1">
            {Object.entries(sessionInfo).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* デバッグ用：生データ */}
      <details className="mt-4">
        <summary className="font-semibold text-blue-700 cursor-pointer">🔍 デバッグ情報（クリックで展開）</summary>
        <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
}