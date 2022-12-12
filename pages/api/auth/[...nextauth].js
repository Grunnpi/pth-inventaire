// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  secret: process.env.SECRET,
  providers: [
    // OAuth authentication providers

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

    CredentialsProvider({
          id: 'credentials',
          name: 'my-project',
          credentials: {
            email: {
              label: 'email',
              type: 'email',
              placeholder: 'jsmith@example.com',
            },
            password: { label: 'Password', type: 'password' },
            tenantKey: {
              label: 'Truc',
              type: 'text',
            },
          },
          async authorize(credentials, req) {

            console.log(credentials)
            return { user:"toto", name: "Toto",  email:"toto@titi.org", image:"/images/profile.jpg",  data: { token:"x", refreshToken:"y"}}

            const payload = {
              email: credentials.email,
              password: credentials.password,
            };

            const res = await fetch('http://localhost:3000/api/tokens', {
              method: 'POST',
              body: JSON.stringify(payload),
              headers: {
                'Content-Type': 'application/json',
                tenant: credentials.tenantKey,
                'Accept-Language': 'en-US',
              },
            });

            const user = await res.json();
            if (!res.ok) {
              throw new Error(user.exception);
            }
            // If no error and we have user data, return it
            if (res.ok && user) {
              return user;
            }

            // Return null if user data could not be retrieved
            return null;
          },
        }),
  ]

  /*,
    callbacks: {
      async jwt({ token, user, account }) {
        if (account && user) {
          return {
            ...token,
            accessToken: user.data.token,
            refreshToken: user.data.refreshToken,
          };
        }

        return token;
      },

      async session({ session, token }) {
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.accessTokenExpires = token.accessTokenExpires;

        return session;
      },
    },
    theme: {
      colorScheme: 'auto', // "auto" | "dark" | "light"
      brandColor: '', // Hex color code #33FF5D
      logo: '/vercel.svg', // Absolute URL to image
    },
    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === 'development',
    */
})