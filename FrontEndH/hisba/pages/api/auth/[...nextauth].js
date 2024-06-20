import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { setCookie, destroyCookie } from 'nookies';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Enter your username' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' }
          });

          if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Invalid credentials');
          }

          const user = await res.json();

          if (user && user.access && user.refresh) {
            return {
              id: user.user_id,
              name: user.username,
              role: user.role,
              accessToken: user.access,
              refreshToken: user.refresh
            };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          throw new Error('Failed to fetch: ' + error.message);
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // Set session max age to 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      return session;
    },
  },
  events: {
    async signIn({ token, req, res }) {
      setCookie({ res }, 'accessToken', token.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    },
    async signOut({ req, res }) {
      destroyCookie({ res }, 'accessToken', { path: '/' });
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure you have a secret key in your environment variables
});
