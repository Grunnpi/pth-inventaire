import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "../../api/auth/[...nextauth]"

import type { Inventaire } from '../../../interfaces'

// Fake users data

export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  // basic error handling
  if (!session) return res.status(401).json({ message: "Unauthorized stuff" })

  if (session) {
    // map les param
    const {
      query: { params },
      method,
    } = req

    console.log(params.length)
    if (!params) return res.status(500).json({ message: "Invalid parameters" })
    if (params.length < 2) return res.status(500).json({ message: "Invalid parameters count" })

    var the_type = params[0]
    var the_sous_type = params[1]

    var the_detail_id:string = ""
    var isDetailAction = false
    // sanity check : gestion action sur 1 detail
    if (the_sous_type === "detail") {
      if (params.length < 3) {
        return res.status(500).json({ message: "Need ID for detail" })
      } else {
        the_detail_id = params[2]
        isDetailAction = true
      }
    }


    // gestion tentes uniquement
    var gsheet_range:string = ""
    switch (the_type) {
      case "tente":
        if (isDetailAction) {
          gsheet_range = `Matériel!A${the_detail_id}:H${the_detail_id}`
        } else {
          gsheet_range = `Matériel!A301:H309`;
        }
        break
      case "evenement":
        if (isDetailAction) {
          gsheet_range = `Evenement!A${the_detail_id}:E${the_detail_id}`
        } else {
          gsheet_range = `Evenement!A:E`;
        }
        break
      default:
        console.log(the_type + " is invalid parameter")
        return res.status(500).json({ message: the_type + " is invalid parameter" })
    }

    // simulation si pas accès internet ou firewall
    if ( process.env.MY_ENV === "local" ) {
      const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"http://localhost:3000/images/profile.jpg" }, { id: "51", title:"T51", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }, { id: "52", title:"T52", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }]
      if (isDetailAction) {
        return res.status(200).json(inventaires[0])
      }
      else {
        return res.status(200).json(inventaires)
      }
    }
    else {
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

      var inventaire: Inventaire = {id:"", title:"", contentDeMoi:""};
      var inventaires: Inventaire[] = [];
      if (response.data.values) {
        if (isDetailAction) {
          response.data.values.map((oneRowDetail) => (
                inventaire = {id: oneRowDetail[0], title: oneRowDetail[2], contentDeMoi: oneRowDetail[5]})
          )
          return res.status(200).json(inventaire)
        }
        else {
          response.data.values.map((oneRow) => (
                inventaires.push({id: oneRow[0], title: oneRow[2], contentDeMoi: oneRow[3]})
          ))
          return res.status(200).json(inventaires)
        }
      }
      else {
        if (isDetailAction) {
          res.status(404).json({message :"ID[" + the_detail_id + "] for [" + the_type + "] not found"})
        }
        else {
          res.status(404).json({message :"[" + the_type + "] not found"})
        }
      }
    }
  }
}