import Head from 'next/head';
import Image from 'next/image'
import Container from '../../../components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import useSwr from 'swr'
import type { Evenement } from '../../../interfaces'
import { useRouter } from 'next/router';

import Select from "react-select";
import React, { useState, Component } from "react";

import { useSession, signIn, signOut } from "next-auth/react"

import { useEvenementContext } from "../../../context/evenement";

const Unites = [
  { value: "GP", label: "🟣 Groupe" },
  { value: "FA", label: "🟢 Farfadets" },
  { value: "LJ", label: "🟠 Louveteaux/Jeannettes" },
  { value: "SG", label: "🔵 Scouts/Guides" },
  { value: "PC", label: "🔴 Pionniers/Caravelles" },
];

const Types = [
  { value: "Week-End", label: "⛺ Week-End" },
  { value: "Réunion", label: "👍 Réunion" },
  { value: "Journée", label: "🕺 Journée" },
  { value: "Camp", label: "🏕️ Camp" },
];

const Status = [
  { value: "Préparation", label: "Préparation" },
  { value: "Départ", label: "Départ" },
  { value: "Retour", label: "Retour" },
  { value: "Fini", label: "Fini" },
];

function search(valueKey, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].value === valueKey) {
            return myArray[i];
        }
    }
}

import Zoom from "next-image-zoom";

const superTitre = "Evenement"
const superDescription = "Gestion d'un evenement"

const Post2 = () => {
  const router = useRouter()
  const { id } = router.query

  return <p>Post: {id}</p>
}

const Post = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())

  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const { data: unEvenement, error } = useSwr<Evenement>(`/api/gsheet/evenement/detail/${id}`, fetcher)

  const [evenement, setEvenement] = useEvenementContext();

  if (error) return <div>Erreur de chargement un truc</div>

  const [selectedUnitee, setSelectedUnitee] = useState(null);
  const setHandleUnitee = (e) => {
    setSelectedUnitee(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [selectedType, setSelectedType] = useState(null);
  const setHandleType = (e) => {
    setSelectedType(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [selectedStatus, setSelectedStatus] = useState(null);
  const setHandleStatus = (e) => {
    setSelectedStatus(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  var defaultUnite
  var defaultType
  var defaultStatus

  const handleChooseEvenement = async (session, unEvenement:Evenement) => {
      // Stop the form from submitting and refreshing the page.

      if (session) {
        alert(`DANS LA SESSION : ${session.user.mystuff}`)
        setEvenement(unEvenement)
      }
      else {
        alert(`PAS DE SESSION : ${unEvenement.titre}`)
      }

    }


  // Handles the submit event on form submit.
  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    // Get data from the form.
    const data = {
      id: event.target.id.value,
      titre: event.target.titre.value,
      type: selectedType ? selectedType : defaultType.value,
      unite: selectedUnitee ? selectedUnitee : defaultUnite.value,
      status: selectedStatus ? selectedStatus : defaultStatus.value,
    }

    // Send the data to the server in JSON format.
    const JSONdata = JSON.stringify(data)

    // API endpoint where we send form data.
    const endpoint = '/api/gsheet/evenement/update'

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
    alert(`Retour de la chose : ${result.message}`)
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
       defaultUnite = search(unEvenement.unite, Unites);
       defaultType = search(unEvenement.type, Types);
       defaultStatus = search(unEvenement.status, Status);



      return (<Container
          title={`${superTitre}`}
          description={`${superDescription}`}
        >
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {unEvenement.titre}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  <form className="flex flex-col text-gray-700 dark:text-gray-300" onSubmit={handleSubmit}>
                    <label htmlFor="titre">ID</label>
                    <input type="text" id="id" name="id" defaultValue={unEvenement.id}  />

                    <label htmlFor="titre">Titre</label>
                    <input type="text" id="titre" name="titre" defaultValue={unEvenement.titre} required />

                    <label htmlFor="type">Type</label>
                    <div>
                      <Select defaultValue={defaultType} options={Types} onChange={setHandleType}  />
                    </div>

                    <label htmlFor="unite">Unité</label>
                    <div>
                      <Select defaultValue={defaultUnite} options={Unites} onChange={setHandleUnitee}  />
                    </div>

                    <label htmlFor="status">Status</label>
                    <div>
                      <Select defaultValue={defaultStatus} options={Status} onChange={setHandleStatus}  />
                    </div>

                    <button type="submit">Submit</button>
                  </form>
                  <span className="text-gray-500 hover:text-gray-600 transition">
                    <button onClick={() => handleChooseEvenement(session, unEvenement)}>⏏️</button>{' '}
                  </span>
                </p>

                <div className="md:w-48 mt-2 sm:mt-0">
                  <Zoom
                      alt={unEvenement.titre}
                      height={30}
                      width={40}
                      src=""
                      className="rounded-full"
                      layout={"responsive"}
                  />
                </div>
              </div>

            </div>
            <div className="prose dark:prose-dark w-full">ça c'est un evenement</div>
          </article>
        </Container> )
  }
}

export default Post
