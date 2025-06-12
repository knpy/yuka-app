import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'

// デバッグ用：環境変数確認
console.log('NextAuth Debug Info:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'undefined');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : 'undefined');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'defined' : 'undefined');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 環境に応じたNEXTAUTH_URLの確認（環境変数が必要）
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl) {
  console.warn('⚠️ NEXTAUTH_URLが設定されていません。AWS Amplifyの環境変数を確認してください。');
  console.warn('開発環境: https://develop.d3pqwcrqokah2b.amplifyapp.com');
  console.warn('本番環境: https://main.d3pqwcrqokah2b.amplifyapp.com');
}
console.log('設定されたNEXTAUTH_URL:', nextAuthUrl);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile }: any) {
      try {
        console.log('JWT Callback - Account:', account);
        console.log('JWT Callback - Profile:', profile);
        
        if (account) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          console.log('Access token stored:', !!account.access_token);
        }
        return token
      } catch (error) {
        console.error('JWT Callback Error:', error);
        return token
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      try {
        console.log('Session Callback - Token keys:', Object.keys(token));
        
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.expiresAt = token.expiresAt
        
        return session
      } catch (error) {
        console.error('Session Callback Error:', error);
        return session
      }
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }