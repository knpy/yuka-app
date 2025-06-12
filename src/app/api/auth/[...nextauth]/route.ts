import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'

// デバッグ用：環境変数確認
console.log('NextAuth Debug Info:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'undefined');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : 'undefined');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'defined' : 'undefined');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// AWS Amplify環境変数デバッグ
console.log('🔍 AWS Amplify環境変数:');
console.log('AWS_BRANCH:', process.env.AWS_BRANCH);
console.log('AWS_APP_ID:', process.env.AWS_APP_ID);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('VERCEL_URL:', process.env.VERCEL_URL);

// 環境に応じたNEXTAUTH_URLの動的設定
let nextAuthUrl = process.env.NEXTAUTH_URL;

// AWS Amplifyで環境変数が効かない場合の強制設定
if (!nextAuthUrl || nextAuthUrl.includes('localhost')) {
  const hostname = process.env.VERCEL_URL || 
                   process.env.AWS_BRANCH || 
                   process.env.AWS_COMMIT_ID;
  
  if (hostname === 'develop' || process.env.AWS_BRANCH === 'develop') {
    nextAuthUrl = 'https://develop.d3pqwcrqokah2b.amplifyapp.com';
  } else if (hostname === 'main' || process.env.AWS_BRANCH === 'main') {
    nextAuthUrl = 'https://main.d3pqwcrqokah2b.amplifyapp.com';
  } else {
    // デフォルトで開発環境を使用
    nextAuthUrl = 'https://develop.d3pqwcrqokah2b.amplifyapp.com';
  }
  
  console.warn('⚠️ NEXTAUTH_URLを動的に設定:', nextAuthUrl);
} else {
  console.log('✅ 設定済みNEXTAUTH_URL:', nextAuthUrl);
}

// 環境変数を強制上書き
process.env.NEXTAUTH_URL = nextAuthUrl;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email', 
            'profile',
            'https://www.googleapis.com/auth/calendar.readonly'
          ].join(' '),
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    error: '/auth/error', // カスタムエラーページ（オプション）
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile }: any) {
      try {
        // 初回認証時のみaccountとprofileが渡される
        if (account) {
          console.log('🔑 初回認証 - Account:', !!account);
          console.log('👤 初回認証 - Profile:', !!profile);
          
          // OAuth情報をトークンに保存
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
          token.provider = account.provider;
          
          console.log('✅ Access token stored:', !!account.access_token);
          console.log('✅ Refresh token stored:', !!account.refresh_token);
        } else {
          // セッション更新時はaccountがundefinedになる（正常）
          console.log('🔄 セッション更新 - 既存トークン使用');
        }
        
        return token;
      } catch (error) {
        console.error('❌ JWT Callback Error:', error);
        return token;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      try {
        console.log('🎫 Session Callback - Token keys:', Object.keys(token));
        
        // トークン情報をセッションに追加
        if (token.accessToken) {
          session.accessToken = token.accessToken;
          session.refreshToken = token.refreshToken;
          session.expiresAt = token.expiresAt;
          session.provider = token.provider;
          
          console.log('✅ Session updated with tokens');
        } else {
          console.warn('⚠️ No access token in session');
        }
        
        return session;
      } catch (error) {
        console.error('❌ Session Callback Error:', error);
        return session;
      }
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }