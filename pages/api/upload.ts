import formidable from "formidable";
import fs from "fs";
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

const post = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    await uploadGoogleDrive(form);
    return res.status(200).json({ message: "ouais, image quoi" })
  });
};

async function uploadGoogleDrive (form)  {
    console.log(form.openedFiles[0].filepath)
    console.log(form.openedFiles[0].originalFilename)
    console.log(form.openedFiles[0].mimetype)
    console.log(form.openedFiles[0].size)
    const accessTypeForGSheet = ['https://www.googleapis.com/auth/drive.file',
                                           'https://www.googleapis.com/auth/drive',
                                           'https://www.googleapis.com/auth/drive.file',
                                           'https://www.googleapis.com/auth/drive.metadata'
                                         ];
    const jwt = new google.auth.JWT(
          process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          undefined,
          (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          accessTypeForGSheet
        );

      const drive = google.drive({ version: 'v3', auth: jwt });

      const resList = await drive.files.list({
          pageSize: 10,
          fields: 'nextPageToken, files(id, name, trashed, parents, mimeType)',
        });
        const files = resList.data.files;
        if (files.length === 0) {
          console.log('No files found.');
        } else {
          console.log('Files:');
          files.map((file) => {
            console.log(`"${file.name}" (id==${file.id}) (mimeType==${file.mimeType}) (trashed==${file.trashed}) (parents==${file.parents})`);

            if ( file.parents && file.parents[0] === '1kb25TlTfT1ASIbX4ouupcnAnNdQuz8Rv' && false ) {
              drive.permissions.create({
                fileId: file.id,
                //moveToNewOwnersRoot: true,
                //transferOwnership: true,
                        requestBody: {
                          role: 'reader',
                          type: 'anyone',
                          //emailAddress: 'sgdf.thionville@gmail.com'
                        }
              }, (err, retour) => {
               if (err) {
                 // Handle error
                 console.error(`"${file.name}" (id==${file.id}) ` + ' : Ownership donné à SGDF errrrrrrrrrrrror : ', err.message);
               } else {
                 console.log(`"${file.name}" (id==${file.id}) ` + ' : Ownership donné à SGDF ok : ', file.id);
               }
             });
            }
          });
        }



      const fileMetadata = {
        'name': "test2.jpg",
        parents: ['1kb25TlTfT1ASIbX4ouupcnAnNdQuz8Rv']
      };

      const filename = 'public/images/profile.jpg' //form.openedFiles[0].filepath
      const mimeType = 'image/jpeg' // form.openedFiles[0].mimetype
      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filename)
      };

      const fileSize = fs.statSync(filename).size;
    //return res.status(200).json({ message: "ouais, image quoi" })

      console.log("prêt pour UPLOAD ici " + fileSize)
      const createRequest = {
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }
      drive.files.create(createRequest, (err, file) => {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          console.log('File upload avec success et avec Id: ', file.data.id);

/*
          drive.permissions.create({
            fileId: file.data.id,
            resource: {
              role: 'reader',
              type: 'anyone',
            }
          }, (err, retour) => {
           if (err) {
             // Handle error
             console.error(`"${file.data.name}" (id==${file.data.id})` + ' : Ownership public ERROR : ', err.message);
           } else {
             console.log(`"${file.data.name}" (id==${file.data.id})` + ' : Ownership public OK : ', file.data.id);
           }
         });
         */
        }
      });
    console.log("ici")
    return;

}

export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
  req.method === "POST"
    ? post(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? console.log("DELETE")
    : req.method === "GET"
    ? console.log("GET")
    : res.status(404).send("");
};
