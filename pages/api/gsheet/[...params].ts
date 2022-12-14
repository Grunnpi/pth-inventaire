import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "../../api/auth/[...nextauth]"

const fs = require('fs');

import type { Inventaire, Evenement, Utilisateur, Image } from '../../../interfaces'

export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  // map les param
  const {
    query: { params },
    body: { body },
    method,
  } = req


  if (session && !params) return res.status(500).json({ message: "Invalid parameters" })
  if (session && params.length < 2) return res.status(500).json({ message: "Invalid parameters count" })

  var the_type = params[0]
  var the_sous_type = params[1]

  console.log('gsheet : ' + the_type + "/" + the_sous_type + "/" + method)

  // basic error handling
  if (!session) {
    return res.status(401).json({ message: "Unauthorized stuff" })
  }

  if (true) {
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

    if (isDetailAction && the_detail_id === "nouveau") {
      switch (the_type) {
        case "inventaire":
          return res.status(200).json({ rowid: "nouveau" })
          break
        case "evenement":
          return res.status(200).json({ rowid: "nouveau" })
          break
        case "utilisateur":
          return res.status(200).json({ rowid: "nouveau" })
          break
        case "image":
          return res.status(200).json({ rowid: "nouveau" })
          break
        default:
          console.log(the_type + " is invalid parameter")
          return res.status(500).json({ message: the_type + " is invalid parameter" })
      }
    }

    if (the_sous_type === "update") {
      console.log("En mode UPDATE")
      console.log(method)
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un UPDATE")
        const evenement:Evenement = req.body
        console.log(evenement)

        const range ="Evenement"
        const data = [
            {
              values: [[evenement.id,  evenement.titre, evenement.type, evenement.unite, evenement.status]],
              range: `'${range}'!A${evenement.rowid}:E${evenement.rowid}`
            }
            ]

        const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              undefined,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              accessTypeForGSheet
            );
        const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });
         const response = await myGoogleSheet.spreadsheets.values.batchUpdate({
          spreadsheetId: process.env.SHEET_ID,
          requestBody: {
            valueInputOption: "USER_ENTERED"
            , data
            }
         });

        return res.status(200).json({ message: the_type + " update ok" })
      }
    }

    if (the_sous_type === "supprimer") {
      console.log("En mode DELETE")
      console.log(method)
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un DELETE")
        const evenement:Evenement = req.body
        console.log(evenement)

        var batchUpdateRequest = {
          "requests": [
            {
              "deleteDimension": {
                "range": {
                  "sheetId": 1915467561,
                  "dimension": "ROWS",
                  "startIndex": parseInt(evenement.rowid) - 1,
                  "endIndex": parseInt(evenement.rowid)
                }
              }
            }
          ]
        }

        const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              undefined,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              accessTypeForGSheet
            );
        const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });

        const request = {
            // The spreadsheet to apply the updates to.
            spreadsheetId: process.env.SHEET_ID,  // TODO: Update placeholder value.
            resource: batchUpdateRequest,
          };

        const response = await myGoogleSheet.spreadsheets.batchUpdate(request)
        console.log(response)
        return res.status(200).json({ message: the_type + " update ok" })
      }
    }

    if (the_sous_type === "nouveau") {
      console.log("En mode CREATE")
      console.log(method)
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un CREATE")

        const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              undefined,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              accessTypeForGSheet
            );
        const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });


        var the_values = []
        var the_range = ''
        switch (the_type) {
          case "evenement":
            const evenement:Evenement = req.body
            console.log(evenement)
            the_range ="Evenement"
            the_values = [[evenement.id, evenement.titre, evenement.type, evenement.unite, evenement.status]]
            break
          case "image":
            const image:Image = req.body
            console.log(image)
            the_range ="Image"
            the_values = [[image.id, image.nom, image.commentaire, image.googleId, image.url, image.visualisation]]
            break

        }


        const request = {
          spreadsheetId: process.env.SHEET_ID,
          range: the_range,
          valueInputOption: "USER_ENTERED",
          resource: {
                      values: the_values,
                    },
        }

        const response = await myGoogleSheet.spreadsheets.values.append(request);

        console.log('nouvelle entit?? cr??e - on r??cup??re le rowid')
        const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive ?? r??cup??rer l'url de l'image mais zob
        const responseCount = await myGoogleSheet.spreadsheets.values.get({
          spreadsheetId: process.env.SHEET_ID,
          range: the_range,
          valueRenderOption
        });
        const row = responseCount.data.values.length;
        console.log(row)

        return res.status(307).json({ message: the_type + " create ok" , newid:row})
      }
    }

    var gsheet_range:string = ""
    switch (the_type) {
      case "inventaire":
        if (isDetailAction) {
          gsheet_range = `Mat??riel!A${the_detail_id}:L${the_detail_id}`
        } else {
          gsheet_range = `Mat??riel!A2:L`;
        }
        break
      case "evenement":
        if (isDetailAction) {
          gsheet_range = `Evenement!A${the_detail_id}:E${the_detail_id}`
        } else {
          gsheet_range = `Evenement!A2:E`;
        }
        break
      case "utilisateur":
        if (isDetailAction) {
          gsheet_range = `Utilisateur!A${the_detail_id}:E${the_detail_id}`
        } else {
          gsheet_range = `Utilisateur!A2:E`;
        }
        break
      default:
        console.log(the_type + " is invalid parameter")
        return res.status(500).json({ message: the_type + " is invalid parameter" })
    }

    if (true) {
      const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
      const jwt = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            undefined,
            (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            accessTypeForGSheet
          );
      const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });
      const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive ?? r??cup??rer l'url de l'image mais zob
      const response = await myGoogleSheet.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: gsheet_range,
        valueRenderOption
      });

      var idxCol=0
      if (response.data.values) {
        switch (the_type) {
          case "inventaire":
            var inventaire: Inventaire = {id:"", nom: ""};
            var inventaires: Inventaire[] = [];
            if (isDetailAction) {
              idxCol=0
              response.data.values.map((oneRowDetail) => {
                    inventaire = {  rowid: the_detail_id,
                                    id: oneRowDetail[idxCol++],
                                    famille: oneRowDetail[idxCol++],
                                    type: oneRowDetail[idxCol++],
                                    nom: oneRowDetail[idxCol++],
                                    imageid: oneRowDetail[idxCol++],
                                    image_visu: oneRowDetail[idxCol++],
                                    marquage: oneRowDetail[idxCol++],
                                    commentaire: oneRowDetail[idxCol++],
                                    localisation: oneRowDetail[idxCol++],
                                    etat: oneRowDetail[idxCol++],
                                    date_etat: oneRowDetail[idxCol++],
                                    date_arrivee: oneRowDetail[idxCol++],
                                    origine: oneRowDetail[idxCol++],
                                  };
                    idxCol=0;
                    }
              )
              return res.status(200).json(inventaire)
            }
            else {
              var i=2
              idxCol=0
              response.data.values.map((oneRowDetail) => {
                    inventaires.push({
                                    rowid:(i++).toString(),
                                    id: oneRowDetail[idxCol++],
                                    famille: oneRowDetail[idxCol++],
                                    type: oneRowDetail[idxCol++],
                                    nom: oneRowDetail[idxCol++],
                                    imageid: oneRowDetail[idxCol++],
                                    image_visu: oneRowDetail[idxCol++],
                                    marquage: oneRowDetail[idxCol++],
                                    commentaire: oneRowDetail[idxCol++],
                                    localisation: oneRowDetail[idxCol++],
                                    etat: oneRowDetail[idxCol++],
                                    date_etat: oneRowDetail[idxCol++],
                                    date_arrivee: oneRowDetail[idxCol++],
                                    origine: oneRowDetail[idxCol++],
                                  });
                    idxCol=0;
                    }
              )
              console.log(inventaires.length)
              return res.status(200).json(inventaires)
            }
            break
          case "evenement":
            var evenement: Evenement = {id:""};
            var evenements: Evenement[] = [];
            if (isDetailAction) {
              response.data.values.map((oneRowDetail) => (
                    evenement = {rowid: the_detail_id, id: oneRowDetail[0], titre: oneRowDetail[1], type: oneRowDetail[2], unite: oneRowDetail[3], status: oneRowDetail[4]})
              )
              return res.status(200).json(evenement)
            }
            else {
              var i=2
              response.data.values.map((oneRowDetail) => (
                    evenements.push({rowid: (i++).toString(), id: oneRowDetail[0], titre: oneRowDetail[1], type: oneRowDetail[2], unite: oneRowDetail[3], status: oneRowDetail[4]})
              ))
              return res.status(200).json(evenements)
            }
            break
          case "utilisateur":
            var utilisateur: Utilisateur = {id:"", nom:"", mot_de_passe:"", role:""};
            var utilisateurs: Utilisateur[] = [];
            if (isDetailAction) {
              response.data.values.map((oneRowDetail) => (
                    utilisateur = {rowid: the_detail_id, id: oneRowDetail[0], nom: oneRowDetail[1], mot_de_passe: oneRowDetail[2], role: oneRowDetail[3]})
              )
              return res.status(200).json(utilisateur)
            }
            else {
              var i=2
              response.data.values.map((oneRowDetail) => (
                    utilisateurs.push({rowid: (i++).toString(), id: oneRowDetail[0], nom: oneRowDetail[1], mot_de_passe: oneRowDetail[2], role: oneRowDetail[3]})
              ))
              return res.status(200).json(utilisateurs)
            }
            break
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