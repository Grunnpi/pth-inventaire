// pages/api/auth/[...nextauth].jsx
import type { Utilisateur } from '../../../interfaces'
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from 'next-auth/providers/credentials'

import { google } from 'googleapis';

export default NextAuth({
  providers: [
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
/*
            const payload = {
              user: credentials.user,
              password: credentials.password,
            };
*/

            const gsheet_range = `Utilisateur!A2:E`;
            const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
            const jwt = new google.auth.JWT(
                  process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                  undefined,
                  (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                  accessTypeForGSheet
                );
            const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });
            const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive à récupérer l'url de l'image mais zob
            const response = await myGoogleSheet.spreadsheets.values.get({
              spreadsheetId: process.env.SHEET_ID,
              range: gsheet_range,
              valueRenderOption
            });
            if (response.data.values) {
              var utilisateurs: Utilisateur[] = [];
              response.data.values.map((oneRowDetail) => (
                utilisateurs.push({id: oneRowDetail[0], nom: oneRowDetail[1], mot_de_passe: oneRowDetail[2], role: oneRowDetail[3]})
              ))
            }

            const search = what => utilisateurs.find(element => element.id === what);
            const utilisateurX:Utilisateur = search(credentials.user)
            if (utilisateurX) {
              if ( utilisateurX.mot_de_passe === credentials.password ) {
                return { id: utilisateurX.id, user: utilisateurX.id, name: utilisateurX.nom,  email:"toto@titi.org", image:"/images/profile.jpg",  data: { token:"x", refreshToken:"y"}}
              }
              else {
                throw new Error( "mot_de_passe_invalide")
              }
            } else {
              throw new Error( "utilisateur_inconnu")
            }
          },
        }),
  ]

  ,
    callbacks: {
      async jwt({ token }) {
        return token;
      },

      async session({ session }) {
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