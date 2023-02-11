import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';

import { unstable_getServerSession } from "next-auth/next"
import authOptions from "@api/auth/[...nextauth]"

import { Mapping_API_Sheet } from "@interfaces/constants.js"

const fs = require('fs');

import type { Inventaire, Evenement, Utilisateur, Image, Materiel_par_evenement, Requete_suppression } from '@interfaces'

const maxColonneMateriel = "N"
const maxColonneEvenement = "I"
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

//  console.log('gsheet : ' + the_type + "/" + the_sous_type + "/" + method)

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

    /********************************************************************************************
    ** NOUVEAU - retourne une entité vide par défaut avec id:nouveau
    ********************************************************************************************/
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

    /********************************************************************************************
    ** SUPPRIMER
    ********************************************************************************************/
    if (the_sous_type === "supprimer") {
      if (method !== "POST") {
        return res.status(500).json({ message: "Need POST for update" })
      } else {
        console.log("Youpi on fait un DELETE")
        const accessTypeForGSheet = ['https://www.googleapis.com/auth/spreadsheets'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              undefined,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              accessTypeForGSheet
            );
        const myGoogleSheet = google.sheets({ version: 'v4', auth: jwt });

        const search = what => Mapping_API_Sheet.find(element => element.api_name === what);

        const sheetName = search(the_type).sheet_name;
        const requestFindSheetId = {
            spreadsheetId: process.env.SHEET_ID,
            ranges: [ sheetName ],
            includeGridData: false
        };

        var the_sheetId = null
        let myRes = await myGoogleSheet.spreadsheets.get(requestFindSheetId);


        for (i = 0; i < myRes.data.sheets.length; i++) {
          if (myRes.data.sheets[i].properties.title === sheetName) {
            the_sheetId = myRes.data.sheets[i].properties.sheetId
          }
        }

        if ( the_sheetId == null ) {
          return res.status(500).json({ message: the_type + " delete pas possible, on trouve pas le sheetId pour xxx" })
        }

        const requeteSuppression:Requete_suppression = req.body
        var batchUpdateRequest = {}
        if ( requeteSuppression.type_suppression == "unique" ) {
          batchUpdateRequest = {
            "requests": [
              {
                "deleteDimension": {
                  "range": {
                    "sheetId": the_sheetId,
                    "dimension": "ROWS",
                    "startIndex": parseInt(requeteSuppression.rowid_unique) - 1,
                    "endIndex": parseInt(requeteSuppression.rowid_unique)
                  }
                }
              }
            ]
          }
        }
        else {
          batchUpdateRequest = {
            "requests": [
              {
                "deleteDimension": {
                  "range": {
                    "sheetId": the_sheetId,
                    "dimension": "ROWS",
                    "startIndex": parseInt(requeteSuppression.rowid_debut) - 1,
                    "endIndex": parseInt(requeteSuppression.rowid_fin)
                  }
                }
              }
            ]
          }
        }


        const request = {
            // The spreadsheet to apply the updates to.
            spreadsheetId: process.env.SHEET_ID,  // TODO: Update placeholder value.
            resource: batchUpdateRequest,
          };

        const response = await myGoogleSheet.spreadsheets.batchUpdate(request)
        return res.status(200).json({ message: the_type + " update ok" })
      }
    }

    /********************************************************************************************
    ** UPDATE
    ********************************************************************************************/
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
                  values: [[
                    evenement.id,
                    evenement.titre,
                    evenement.type,
                    evenement.unite,
                    evenement.status,
                    evenement.nbFilles,
                    evenement.nbGarcons,
                    evenement.date_debut,
                    evenement.date_fin
                  ]],
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

    /********************************************************************************************
    ** CREATION NOUVEAU/BATCH_INSERT : creation d'une ou plusieurs lignes
    ********************************************************************************************/
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
            the_values = [[
              evenement.id,
              evenement.titre,
              evenement.type,
              evenement.unite,
              evenement.status,
              evenement.nbFilles,
              evenement.nbGarcons,
              evenement.date_debut,
              evenement.date_fin
            ]]
            break
          case "inventaire":
            const inventaire:Inventaire = req.body
            the_range = "Matériel"
            the_values = [[
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
            ]]
            break
          case "image":
            const image:Image = req.body
            the_range ="Image"
            the_values = [[
              image.id,
              image.nom,
              image.commentaire,
              image.googleId,
              image.url,
              image.visualisation
            ]]
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
            break
        }

        const request = {
          spreadsheetId: process.env.SHEET_ID,
          range: the_range,
          valueInputOption: "USER_ENTERED", //RAW
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

    /********************************************************************************************
    ** GET - retourne une ligne en fonction du rowid ou bien la liste de toutes les entitées
    ********************************************************************************************/
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
              idxCol=0
              response.data.values.map((oneRowDetail) => (
                    evenement = {
                      rowid: the_detail_id,
                      id: oneRowDetail[idxCol++],
                      titre: oneRowDetail[idxCol++],
                      type: oneRowDetail[idxCol++],
                      unite: oneRowDetail[idxCol++],
                      status: oneRowDetail[idxCol++],
                      nbFilles: oneRowDetail[idxCol++],
                      nbGarcons: oneRowDetail[idxCol++],
                      date_debut: oneRowDetail[idxCol++],
                      date_fin: oneRowDetail[idxCol++],
                    }
              ))
              return res.status(200).json(evenement)
            }
            else {
              var i=2
              idxCol=0
              response.data.values.map((oneRowDetail) => {
                    evenements.push({
                      rowid: (i++).toString(),
                      id: oneRowDetail[idxCol++],
                      titre: oneRowDetail[idxCol++],
                      type: oneRowDetail[idxCol++],
                      unite: oneRowDetail[idxCol++],
                      status: oneRowDetail[idxCol++],
                      nbFilles: oneRowDetail[idxCol++],
                      nbGarcons: oneRowDetail[idxCol++],
                      date_debut: oneRowDetail[idxCol++],
                      date_fin: oneRowDetail[idxCol++],
                    });
                    idxCol=0;
              })
              return res.status(200).json(evenements)
            }
            break
          case "utilisateur":
            var utilisateur: Utilisateur = {id:"", nom:"", mot_de_passe:"", role:""};
            var utilisateurs: Utilisateur[] = [];
            if (isDetailAction) {
              response.data.values.map((oneRowDetail) => (
                    utilisateur = {
                      rowid: the_detail_id,
                      id: oneRowDetail[0],
                      nom: oneRowDetail[1],
                      mot_de_passe: oneRowDetail[2],
                      role: oneRowDetail[3]
                    })
              )
              return res.status(200).json(utilisateur)
            }
            else {
              var i=2
              response.data.values.map((oneRowDetail) => (
                    utilisateurs.push({
                      rowid: (i++).toString(),
                      id: oneRowDetail[0],
                      nom: oneRowDetail[1],
                      mot_de_passe: oneRowDetail[2],
                      role: oneRowDetail[3]
                    })
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