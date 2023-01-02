// pages/api/auth/[...nextauth].jsx
import type { Inventaire, Evenement, SessionUser } from '../../../interfaces'
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from 'next-auth/providers/credentials'


export default NextAuth({
  secret: process.env.SECRET,
  providers: [
    // OAuth authentication providers

//    GoogleProvider({
//      clientId: process.env.GOOGLE_ID,
//      clientSecret: process.env.GOOGLE_SECRET,
//    }),

    CredentialsProvider({
          id: 'credentials',
          name: 'SGDF PTH',
          credentials: {
            user: {
              label: 'Utilisateur',
              type: 'text',
              placeholder: 'Moi',
            },
            password: {
              label: 'Password',
              type: 'password'
            },
          },
          async authorize(credentials, req) {
            //return { user:"toto", name: "Toto",  email:"toto@titi.org", image:"/images/profile.jpg",  data: { token:"x", refreshToken:"y"}}

            const payload = {
              user: credentials.user,
              password: credentials.password,
            };

            const res = await fetch(`${process.env.NEXTAUTH_URL}/api/gsheet/utilisateur/detail/${credentials.user}`);
            console.log(res)
            const user = await res.json();
            if (!res.ok) {
              throw new Error(user.exception);
            }

            console.log("-----------------------------------------user")
            console.log(user)
            // If no error and we have user data, return it
            if (res.ok && user) {
              var theSessionUser:SessionUser = {
                user: user.id,
                name: user.nom,
                email: "",
                image: "",
                mystuff: "mon test",
                data: {
                  token: "x",
                  refreshToken: "x"
                }
              }
              return theSessionUser;
            }

            // Return null if user data could not be retrieved
            return null;
          },
        }),
  ]

  ,
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
      logo: '/images/SGDF.png', // Absolute URL to image
    },
    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === 'development',

})