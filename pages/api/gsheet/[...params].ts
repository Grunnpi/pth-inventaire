import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "@api/auth/[...nextauth]"

const fs = require('fs');

import type { Inventaire, Evenement, Utilisateur, Image, Materiel_par_evenement } from '@interfaces'

const maxColonneMateriel = "N"
const maxColonneEvenement = "E"
const maxColonneImage = "F"
const maxColonneUtilisateur = "D"
const maxColonneMaterielParEvenement = "L"

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
        case "materiel_par_evenement":
          return res.status(200).json({ rowid: "nouveau" })
          break
        default:
          return res.status(500).json({ message: the_type + " is invalid parameter" })
      }
    }

    if (the_sous_type === "update") {
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un UPDATE")

        var the_data = []
        switch (the_type) {
          case "evenement":
            const evenement:Evenement = req.body
            the_data = [
                {
                  values: [[evenement.id,  evenement.titre, evenement.type, evenement.unite, evenement.status]],
                  range: `'Evenement'!A${evenement.rowid}:${maxColonneEvenement}${evenement.rowid}`
                }
                ]
            break
          case "inventaire":
            const inventaire:Inventaire = req.body
            the_data = [
                {
                  values: [[
                    inventaire.id,
                    inventaire.famille,
                    inventaire.type,
                    inventaire.nom,
                    inventaire.imageid,
                    inventaire.image_visu,
                    inventaire.marquage,
                    inventaire.commentaire,
                    inventaire.localisation,
                    inventaire.etat,
                    inventaire.date_etat,
                    inventaire.date_arrivee,
                    inventaire.origine,
                    inventaire.image_url
                  ]],
                  range: `'Matériel'!A${inventaire.rowid}:${maxColonneMateriel}${inventaire.rowid}`
                }
                ]
            break
        }


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
            , data : the_data
            }
         });

        return res.status(200).json({ message: the_type + " update ok" })
      }
    }

    if (the_sous_type === "supprimer") {
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un DELETE")
        const evenement:Evenement = req.body

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
        return res.status(200).json({ message: the_type + " update ok" })
      }
    }

    if (the_sous_type === "nouveau" || the_sous_type === "batch_insert" ) {
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un CREATE (" + the_sous_type + ')')

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
            the_range = "Evenement"
//            the_range= `'Evenement'!A:${maxColonneEvenement}`
            the_values = [[evenement.id, evenement.titre, evenement.type, evenement.unite, evenement.status]]
            break
          case "image":
            const image:Image = req.body
            the_range ="Image"
            the_values = [[image.id, image.nom, image.commentaire, image.googleId, image.url, image.visualisation]]
            break
          case "materiel_par_evenement":
            const materiel_par_evenement_liste:Materiel_par_evenement[] = req.body
            the_range = "Matériel_par_Evenement"
            the_values = []
            materiel_par_evenement_liste.forEach(materiel_par_evenement => {
              the_values.push([
                materiel_par_evenement.rowid_evenement,
                materiel_par_evenement.id_evenement,
                materiel_par_evenement.nom_evenement,
                materiel_par_evenement.rowid_materiel,
                materiel_par_evenement.id_materiel,
                materiel_par_evenement.nom_materiel
              ])
            })
            //the_values = [[image.id, image.nom, image.commentaire, image.googleId, image.url, image.visualisation]]
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

        const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive à récupérer l'url de l'image mais zob
        const responseCount = await myGoogleSheet.spreadsheets.values.get({
          spreadsheetId: process.env.SHEET_ID,
          range: the_range,
          valueRenderOption
        });
        const row = responseCount.data.values.length;
        return res.status(307).json({ message: the_type + " create ok" , newid:row})
      }
    }

    var gsheet_range:string = ""
    switch (the_type) {
      case "inventaire":
        if (isDetailAction) {
          gsheet_range = `Matériel!A${the_detail_id}:${maxColonneMateriel}${the_detail_id}`
        } else {
          gsheet_range = `Matériel!A2:${maxColonneMateriel}`;
        }
        break
      case "evenement":
        if (isDetailAction) {
          gsheet_range = `Evenement!A${the_detail_id}:${maxColonneEvenement}${the_detail_id}`
        } else {
          gsheet_range = `Evenement!A2:${maxColonneEvenement}`;
        }
        break
      case "utilisateur":
        if (isDetailAction) {
          gsheet_range = `Utilisateur!A${the_detail_id}:${maxColonneUtilisateur}${the_detail_id}`
        } else {
          gsheet_range = `Utilisateur!A2:${maxColonneUtilisateur}`;
        }
        break
      case "materiel_par_evenement":
        if (isDetailAction) {
          gsheet_range = `Matériel_par_Evenement!A${the_detail_id}:${maxColonneMaterielParEvenement}${the_detail_id}`
        } else {
          gsheet_range = `Matériel_par_Evenement!A2:${maxColonneMaterielParEvenement}`;
        }
        break
      default:
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
      const valueRenderOption = 'UNFORMATTED_VALUE' // test pour voir si on arrive à récupérer l'url de l'image mais zob
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
                                    image_url: oneRowDetail[idxCol++],
                                  };
                    idxCol=0;
                    }
              )
              //inventaire.image_url = "/images/profile.jpg"
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
                                    image_url: oneRowDetail[idxCol++],
                                  });
                    idxCol=0;
                    }
              )
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
           case "materiel_par_evenement":
             var materiel_par_evenement: Materiel_par_evenement = {id_evenement:"", id_materiel:"",};
             var materiel_par_evenements: Materiel_par_evenement[] = [];
             if (isDetailAction) {
               response.data.values.map((oneRowDetail) => {
                     idxCol=0
                     materiel_par_evenement = {
                        rowid: the_detail_id,
                        rowid_evenement: oneRowDetail[idxCol++],
                        id_evenement: oneRowDetail[idxCol++],
                        nom_evenement: oneRowDetail[idxCol++],
                        rowid_materiel: oneRowDetail[idxCol++],
                        id_materiel: oneRowDetail[idxCol++],
                        nom_materiel: oneRowDetail[idxCol++]
                     }}
               )
               return res.status(200).json(materiel_par_evenement)
             }
             else {
               var i=2
               response.data.values.map((oneRowDetail) => {
                     idxCol=0
                     materiel_par_evenements.push({
                        rowid: (i++).toString(),
                        rowid_evenement: oneRowDetail[idxCol++],
                        id_evenement: oneRowDetail[idxCol++],
                        nom_evenement: oneRowDetail[idxCol++],
                        rowid_materiel: oneRowDetail[idxCol++],
                        id_materiel: oneRowDetail[idxCol++],
                        nom_materiel: oneRowDetail[idxCol++]
                     })
                     idxCol=0
               })
               return res.status(200).json(materiel_par_evenements)
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