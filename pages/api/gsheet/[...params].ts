import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "../../api/auth/[...nextauth]"

import type { Inventaire, Evenement, Utilisateur } from '../../../interfaces'

// Fake users data

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

  // basic error handling
  if (!session) {
    if (the_type !== "utilisateur") {
      return res.status(401).json({ message: "Unauthorized stuff" })
    }
    else {
      console.log("gsheet fetch user / no session")
    }
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
        case "tente":
          return res.status(200).json({ id: "nouveau" })
          break
        case "evenement":
          return res.status(200).json({ id: "nouveau" })
          break
        case "utilisateur":
          return res.status(200).json({ id: "nouveau" })
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
              values: [["=LIGNE()", evenement.titre, evenement.type, evenement.unite, evenement.status]],
              range: `'${range}'!A${evenement.id}:E${evenement.id}`
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
                  "startIndex": parseInt(evenement.id) - 1,
                  "endIndex": parseInt(evenement.id)
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

            resource: {
              // A list of updates to apply to the spreadsheet.
              // Requests will be applied in the order they are specified.
              // If any request is not valid, no requests will be applied.
              requests: batchUpdateRequest,  // TODO: Update placeholder value.

              // TODO: Add desired properties to the request body.
            },

            //auth: authClient,
          };

        const response = await myGoogleSheet.spreadsheets.batchUpdate(request)

          //spreadsheetId: process.env.SHEET_ID,
        //  resource: batchUpdateRequest
         /* resource:
            requests: [
                      {
                        deleteDimension: {
                          range: {
                            sheetId: "1915467561",
                            dimension: "ROWS",
                            startIndex: parseInt(evenement.id) - 1,
                            endIndex: evenement.id
                          }
                        }
                      }
                    ]
          */


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
        const evenement:Evenement = req.body
        console.log(evenement)

        const range ="Evenement"

        const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              undefined,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              accessTypeForGSheet
            );
        const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });
        const request = {
          spreadsheetId: process.env.SHEET_ID,
          range: `Evenement`,
          valueInputOption: "USER_ENTERED",
          resource: {
                      values: [["=LIGNE()", evenement.titre, evenement.type, evenement.unite, evenement.status]],
                    },
        }

         const response = await myGoogleSheet.spreadsheets.values.append(request);

        const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive à récupérer l'url de l'image mais zob
        const responseCount = await myGoogleSheet.spreadsheets.values.get({
          spreadsheetId: process.env.SHEET_ID,
          range: `Evenement`,
          valueRenderOption
        });
       const row = responseCount.data.values.length;

        return res.status(307).json({ message: the_type + " create ok" , newid:row})
       //return res.redirect(307, `/evenement/detail/666`);

//        return res.status(200).json({ message: the_type + " create ok" , newid:row})
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

    // simulation si pas accès internet ou firewall
    if ( process.env.MY_ENV === "local" ) {
      console.log("ici Paris")
      /*
      switch (the_type) {
        case "tente":
            const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"http://localhost:3000/images/profile.jpg" }, { id: "51", title:"T51", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }, { id: "52", title:"T52", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }]
            if (isDetailAction) {
              return res.status(200).json(inventaires[0])
            }
            else {
              return res.status(200).json(inventaires)
            }
          break
        case "evenement":
            const evenement: Evenement[] = [{ id: "50", title:"T50", contentDeMoi:"http://localhost:3000/images/profile.jpg" }, { id: "51", title:"T51", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }, { id: "52", title:"T52", contentDeMoi:"http://localhost:3000/images/profile.jpg"  }]
            if (isDetailAction) {
              return res.status(200).json(evenement[0])
            }
            else {
              return res.status(200).json(evenement)
            }
          break
        case "utilisateur":
            const utilisateurs: Utilisateur[] = [{ id: "2", nom:"Utilisateur2", mot_de_passe:"xxx", role:"" }]
            if (isDetailAction) {
              return res.status(200).json(utilisateurs[0])
            }
            else {
              return res.status(200).json(utilisateurs)
            }
          break
      }
      */
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


      if (response.data.values) {
        switch (the_type) {
          case "tente":
            var inventaire: Inventaire = {id:"", title:"", contentDeMoi:""};
            var inventaires: Inventaire[] = [];
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
            break
          case "evenement":
            var evenement: Evenement = {id:""};
            var evenements: Evenement[] = [];
            if (isDetailAction) {
              response.data.values.map((oneRowDetail) => (
                    evenement = {id: oneRowDetail[0], titre: oneRowDetail[1], type: oneRowDetail[2], unite: oneRowDetail[3], status: oneRowDetail[4]})
              )
              return res.status(200).json(evenement)
            }
            else {
              response.data.values.map((oneRowDetail) => (
                    evenements.push({id: oneRowDetail[0], titre: oneRowDetail[1], type: oneRowDetail[2], unite: oneRowDetail[3], status: oneRowDetail[4]})
              ))
              return res.status(200).json(evenements)
            }
            break
          case "utilisateur":
            var utilisateur: Utilisateur = {id:"", nom:"", mot_de_passe:"", role:""};
            var utilisateurs: Utilisateur[] = [];
            if (isDetailAction) {
              response.data.values.map((oneRowDetail) => (
                    utilisateur = {id: oneRowDetail[0], nom: oneRowDetail[1], mot_de_passe: oneRowDetail[2], role: oneRowDetail[3]})
              )
              return res.status(200).json(utilisateur)
            }
            else {
              response.data.values.map((oneRowDetail) => (
                    utilisateurs.push({id: oneRowDetail[0], nom: oneRowDetail[1], mot_de_passe: oneRowDetail[2], role: oneRowDetail[3]})
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