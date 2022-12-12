import type { NextApiRequest, NextApiResponse } from 'next'
import type { Inventaire } from '../../interfaces'
import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "../api/auth/[...nextauth]"

// Fake users data
const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"http://localhost:3000/images/profile.jpg" }, { id: "51", title:"T51", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }, { id: "52", title:"T52", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }]

export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session) {
      // auth omitted...
      if ( process.env.MY_ENV === "local" ) {
            console.log("Mock data list")
            const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"50" }, { id: "51", title:"T51", contentDeMoi:"51"  }, { id: "52", title:"T52", contentDeMoi:"52"  }]

            res.status(200).json(inventaires)
      }
      else {
          const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
          const jwt = new google.auth.JWT(
                process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                undefined,
                (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                target
              );
          const sheets = google.sheets({ version: 'v4', auth: jwt });

          const range = `Matériel!A301:H309`;

          const valueRenderOption = 'UNFORMATTED_VALUE'
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range,
            valueRenderOption
          });

         // var data = [{ question: "what is your name?", answer: "Ben", topic: "names" }, { question: "what is your name?", answer: "Ben", topic: "names" }, { question: "What is dog's name?", answer: "Snugglets", topic: "names" }, { question: "What is your brother's age?", answer: 55, topic: "ages" }],
          var inventaires: Inventaire[] = [];
          if (response.data.values) {
              response.data.values.map((oneRow) => (
                  inventaires.push({id: oneRow[0], title: oneRow[2], contentDeMoi: oneRow[3]})
              ))
          }
          console.log(inventaires);

          res.status(200).json(inventaires)
      }
  } else {
    res.status(401).json({ message: "Pas touche" })
  }
}