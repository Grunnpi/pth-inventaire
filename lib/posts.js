import { google } from 'googleapis';

export async function getSortedPostsData() {
  // auth omitted...
  if ( process.env.MY_ENV === "local" ) {
        console.log("Mock data list")
        const fileNames = await [ { "id" : "50", "title" : "Title 50", "contentDeMoi" : "content 50" } , { "id" : "51", "title" : "Title 51", "contentDeMoi" : "content 51" }, { "id" : "52", "title" : "Title 52", "contentDeMoi" : "content 52" } ];
        console.log(fileNames)


        return fileNames
  }
  else {
      const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
      const jwt = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            null,
            (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            target
          );
      const sheets = google.sheets({ version: 'v4', auth: jwt });

      const range = `Inventaire!A2:C5`;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range,
      });

      const [id, title, contentDeMoi] = response.data.values[0];
      console.log(id, title, contentDeMoi)
      return {
          props: {
              id,
              title,
              contentDeMoi
          }
      }
  }
}

export async function getPostData(the_id) {
    // auth omitted...
    if ( process.env.MY_ENV === "local" ) {
        console.log("Mock data 50")
        var data = require('../mock/inventaire.' + the_id + '.json');
        console.log(data)
        const id = data.id
        const title = data.title
        const contentDeMoi = data.contentDeMoi
        return {
            props: {
                id,
                title,
                contentDeMoi
            }
        }
    }
    else {
        const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
        const jwt = new google.auth.JWT(
              process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
              null,
              (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
              target
            );
        const sheets = google.sheets({ version: 'v4', auth: jwt });

        const { id } = query;
        const range = `Inventaire!A${id}:C${id}`;

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.SHEET_ID,
          range,
        });

        const [title, contentDeMoi] = response.data.values[0];
        console.log(title, contentDeMoi)
        return {
            props: {
                title,
                contentDeMoi
            }
        }
    }
}