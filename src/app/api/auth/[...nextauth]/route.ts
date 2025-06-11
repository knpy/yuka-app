// @ts-expect-error NextAuth v4 types
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// デバッグ用：環境変数確認
console.log('NextAuth Debug Info:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'undefined');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : 'undefined');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'defined' : 'undefined');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// @ts-expect-error NextAuth v4 configuration
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          prompt: 'consent',
          access_type: 'offline'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token-calendar',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('JWT Callback - Account:', account);
      console.log('JWT Callback - Profile:', profile);
      
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        console.log('Access token stored:', !!account.access_token);
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - Token keys:', Object.keys(token));
      
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.expiresAt = token.expiresAt
      
      return session
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}

// @ts-expect-error NextAuth v4 handler
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }