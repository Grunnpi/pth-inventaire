import Head from 'next/head';
import Image from 'next/image'
import Container from '../../../components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import { useSession, signIn, signOut } from "next-auth/react"

import useSwr from 'swr'
import type { Inventaire } from '../../../interfaces'
import { useRouter } from 'next/router';

import Select from "react-select";

import Zoom from "next-image-zoom";

import AlertConfirm, { Button } from 'react-alert-confirm';
import "react-alert-confirm/lib/style.css";

import { useState } from "react";


const Types = [
  { value: "Tente", label: "⛺ Tente" },
  { value: "Intendance", label: "🥣 Intendance" },
  { value: "Outils", label: "🔨 Outils" },
  { value: "Jeux", label: "🎲 Jeux" },
  { value: "Pédagogie", label: "👍 Pédagogie" },
  { value: "Divers", label: "❔ Divers" },
];

const Etat = [
  { value: "Neuf", label: "🤩 Neuf" },
  { value: "Bon", label: "😝 Bon" },
  { value: "Moyen", label: "😐 Moyen" },
  { value: "Mauvais", label: "😒 Mauvais" },
  { value: "HS", label: "💀 HS" },
];

const Post = () => {
  const { data: session } = useSession()

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const router = useRouter()
  const { id } = router.query
  const { data: unEvenement, error } = useSwr<Inventaire>(`/api/gsheet/inventaire/detail/${id}`, fetcher)
  if (error) return <div>Erreur de chargement un truc</div>

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

const [selectedUnitee, setSelectedUnitee] = useState(null);

  const setHandleUnitee = (e) => {
    setSelectedUnitee(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [selectedType, setSelectedType] = useState(null);
  const setHandleType = (e) => {
    setSelectedType(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [selectedEtat, setSelectedEtat] = useState(null);
  const setHandleEtat = (e) => {
    setSelectedEtat(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  var defaultType
  var defaultEtat

  // Handles the submit event on form submit.
    const handleSubmit = async (event) => {
      // Stop the form from submitting and refreshing the page.
      event.preventDefault()

      // Get data from the form.
      const data = {
        rowid: event.target.rowid.value,
        id: event.target.id.value,
        nom: event.target.nom.value,
        type: selectedType ? selectedType : defaultType.value,
      }

      // Send the data to the server in JSON format.
      const JSONdata = JSON.stringify(data)

      // API endpoint where we send form data.
      const endpoint = event.target.rowid.value ==="nouveau" ? '/api/gsheet/evenement/nouveau' : '/api/gsheet/evenement/update'

      // Form the request for sending data to the server.
      const options = {
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
      const response = await fetch(endpoint, options)

      // Get the response data from server as JSON.
      // If server returns the name submitted, that means the form works.
      const result = await response.json()
      if (event.target.rowid.value ==="nouveau") {
        if (response.status == 307) {
           router.push('/evenement/detail/' + result.newid)
        }
      }
      else {
        alert(`Mise à jour : ${result.message}`)
      }
    }

    // Handles the submit event on form submit.
      const handleDelete = async (session, unEvenement:Inventaire) => {


        const [action] = await AlertConfirm({title:'Sûr de vouloir supprimer cet évenement ?!', desc:"un si bel évenement...."});
        if (action) {
          // Stop the form from submitting and refreshing the page.
          event.preventDefault()

          // Get data from the form.
          const data = unEvenement

          // Send the data to the server in JSON format.
          const JSONdata = JSON.stringify(data)

          // API endpoint where we send form data.
          const endpoint = '/api/gsheet/evenement/supprimer'

          // Form the request for sending data to the server.
          const options = {
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
          const response = await fetch(endpoint, options)

          // Get the response data from server as JSON.
          // If server returns the name submitted, that means the form works.
          const result = await response.json()
          alert(`Mise à jour : ${result.message}`)
          if (response.status == 200) {
             router.push('/evenement')
          }
        }
      }


  if (!unEvenement) {
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
      defaultType = "Tente"
      return (<Container
          title={`PTH [${unEvenement.nom}]`}
          description="A collection of code snippets – including serverless functions, Node.js scripts, and CSS tricks."
        >
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {unEvenement.nom}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  {unEvenement.nom}
                </p>

                <form className="flex flex-col text-gray-700 dark:text-gray-300" onSubmit={handleSubmit}>
                  <label htmlFor="titre">ligne</label>
                  <input type="text" id="rowid" name="rowid" defaultValue={unEvenement.rowid}  readOnly/>
                  <label htmlFor="titre">ID</label>
                  <input type="text" id="id" name="id" defaultValue={unEvenement.id}/>

                  <label htmlFor="titre">Nom</label>
                  <input type="text" id="titre" name="titre" defaultValue={unEvenement.nom} required />

                  <label htmlFor="type">Famille</label>
                  <div>
                    <Select defaultValue={defaultType} options={Types} onChange={setHandleType}  />
                  </div>
                  <label htmlFor="type">Type</label>
                  <div>
                    <Select defaultValue={defaultType} options={Types} onChange={setHandleType}  />
                  </div>

                  <label htmlFor="status">Etat</label>
                  <div>
                    <Select defaultValue={defaultEtat} options={Etat} onChange={setHandleEtat}  />
                  </div>
                  <label>Commentaire</label>
                  <textarea
                    className="bg-gray-200 w-full rounded-lg shadow border p-2"
                    rows={3}
                    placeholder="Ecrivez votre publication ici"
                    onChange={setHandleEtat}
                    name="pub"
                    id="pub"
                    value={unEvenement.commentaire}
                    ></textarea>
                  <label>Marquage</label>
                  <textarea
                    className="bg-gray-200 w-full rounded-lg shadow border p-2"
                    rows={2}
                    placeholder=""
                    onChange={setHandleEtat}
                    name="pub"
                    id="pub"
                    value={unEvenement.marquage}
                    ></textarea>
                  <label htmlFor="titre">Localisation</label>
                  <input className="bg-gray-200 w-full rounded-lg shadow border p-2"
                  type="text" id="titre" name="titre" defaultValue={unEvenement.localisation} required />

                  <button type="submit">💾 Sauver</button>
                </form>
                <span className="flex flex-col justify-center text-gray-500 hover:text-gray-600">
                  <button onClick={() => handleDelete(session, unEvenement)}>🗑 Supprimer️</button>{' '}
                </span>

                <div className="md:w-48 mt-2 sm:mt-0">
                  <Zoom
                      alt={unEvenement.nom}
                      height={30}
                      width={40}
                      src={unEvenement.image_visu}
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
