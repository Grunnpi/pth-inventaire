import type { NextApiRequest, NextApiResponse } from 'next'
import type { Inventaire } from '../../../interfaces'
import { google } from 'googleapis';

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {

  // auth omitted...
  if ( process.env.MY_ENV === "local" ) {
    console.log("Mock data list")
    const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"50" }, { id: "51", title:"T51", contentDeMoi:"51"  }, { id: "52", title:"T52", contentDeMoi:"52"  }]
     const {
        query: { id, title, contentDeMoi },
        method,
      } = req

    switch (method) {
        case 'GET':
          // Get data from your database
          res.status(200).json(inventaires[1])
          break
        case 'PUT':
          // Update or create data in your database
          res.status(200).json({ id, title: "name" || `User ${id}` })
          break
        default:
          res.setHeader('Allow', ['GET', 'PUT'])
          res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
  else {
     const {
        query: { id },
        method,
      } = req

      const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
      const jwt = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            undefined,
            (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            target
          );
      const sheets = google.sheets({ version: 'v4', auth: jwt });

      const range = `Matériel!A${id}:H${id}`

      const valueRenderOption = 'UNFORMATTED_VALUE'
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range,
        valueRenderOption
      });

      var inventaire: Inventaire;
      if (response.data.values) {
          response.data.values.map((oneRow) => (
              inventaire = {id: oneRow[0], title: oneRow[2], contentDeMoi: oneRow[5]})
          )
      }
      console.log(inventaire);
      res.status(200).json(inventaire)
  }
}