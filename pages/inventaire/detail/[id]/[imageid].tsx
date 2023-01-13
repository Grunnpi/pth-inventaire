import Head from 'next/head';
import Image from 'next/image'
import Container from '../../../../components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import { useSession, signIn, signOut } from "next-auth/react"

import useSwr from 'swr'
import type { Inventaire } from '../../../../interfaces'
import { useRouter } from 'next/router';

import Zoom from "next-image-zoom";

import AlertConfirm, { Button } from 'react-alert-confirm';
import "react-alert-confirm/lib/style.css";

import { useState } from "react";

const Post = () => {
  const { data: session } = useSession()

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const router = useRouter()
  const { id, imageid } = router.query
  const { data: post, error } = useSwr<Inventaire>(`/api/gsheet/inventaire/detail/${id}`, fetcher)
  if (error) return <div>Erreur de chargement un truc</div>

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);


  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    event.preventDefault()

    const body = new FormData();
    body.append("file", image);

    const response = await fetch("/api/upload", {
      method: "POST",
      body
    });

    const result = await response.json()

    // sauve la ref dans IMAGE

    // Get data from the form.
      const data = {
        rowid: "nouveau",
        id: "=LIGNE()",
        nom: image.name,
        commentaire: "",
        googleId: result.fileid,
        url: '=CONCAT("https://drive.google.com/uc?export=view&id=";INDIRECT("D" & LIGNE()))',
        visualisation: '=IMAGE(INDIRECT("E" & LIGNE()))'
      }

      // Send the data to the server in JSON format.
      var JSONdata = JSON.stringify(data)

      // API endpoint where we send form data.
      const endpoint = '/api/gsheet/image/nouveau'

      // Form the request for sending data to the server.
      var options = {
        // The method is POST because we are sending data.
        method: 'POST',
        // Tell the server we're sending JSON.
        headers: {
          'Content-Type': 'application/json',
        },
        // Body of the request is the JSON data we created above.
        body: JSONdata,
      }

      // Send the form data to our forms API on Vercel and get a response.
      const responseImage = await fetch(endpoint, options)

      // Get the response data from server as JSON.
      // If server returns the name submitted, that means the form works.
      const resultImage = await responseImage.json()

        alert(`Image dans gsheet : ${resultImage.message} avec ${resultImage.newid} pour ${id}`)

        var responseGetInventaire = await fetch(`/api/gsheet/inventaire/detail/${id}`)

        const unInventaireUpdate:Inventaire = await responseGetInventaire.json()
        unInventaireUpdate.imageid = resultImage.newid
        unInventaireUpdate.image_visu = '=IMAGE(INDIRECT("N" & LIGNE()))',
        unInventaireUpdate.image_url = '=RECHERCHEV(INDIRECT("E" & LIGNE());Image!A:E;5;FAUX)'

        JSONdata = JSON.stringify(unInventaireUpdate)
        options = {
          // The method is POST because we are sending data.
          method: 'POST',
          // Tell the server we're sending JSON.
          headers: {
            'Content-Type': 'application/json',
          },
          // Body of the request is the JSON data we created above.
          body: JSONdata,
        }

        alert(JSONdata)

        const responseUpdateInventaire = await fetch(`/api/gsheet/inventaire/update/${id}`, options)
        alert(responseUpdateInventaire.status)
        alert("Maj Inventaire")


  };


  if (!post) {
    return (<Container
                 title={`???`}
                 description="Je charge..."
               >
                 <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
                   <div className="flex justify-between w-full mb-8">
          <div>
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
              Patience
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              <PacmanLoader color="hsla(216, 67%, 53%, 1)" />
            </p>
          </div>
        </div>
        <div className="prose dark:prose-dark w-full">ceci n'est pas une tente...</div>
      </article>
    </Container> )
  }
  else {
      return (<Container
          title={`PTH [${post.nom}]`}
          description="A collection of code snippets – including serverless functions, Node.js scripts, and CSS tricks."
        >
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {post.nom}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href={`/inventaire/detail/${id}`} >
                    ◀️ Revenir vers {post.nom}
                  </a>
                </p>

                <img
                  src={createObjectURL}
                  height={30}
                  width={40}
                />
                <form >
                  <h4>Select Image</h4>
                  <input type="file" name="myImage" accept="image/*" onChange={uploadToClient} />

                  <button
                    className="btn btn-primary"
                    type="submit"
                    onClick={uploadToServer}
                  ><i class="bi bi-cloud-arrow-up"></i> Upload</button>
                </form>
                Ici
                <p className="text-gray-700 dark:text-gray-300">
                  {image ? (image.name ? image.name  :"nullx") : "nulll"}
                </p>
                Et la

                <div className="md:w-48 mt-2 sm:mt-0">
                  <Zoom
                      alt={post.nom}
                      height={30}
                      width={40}
                      src={post.image_visu}
                      className="rounded-full"
                      layout={"responsive"}
                  />
                </div>
              </div>
            </div>
            <div className="prose dark:prose-dark w-full">ça c'est une tente</div>
          </article>
        </Container> )
  }
}

export default Post
