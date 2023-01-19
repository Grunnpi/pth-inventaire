import Head from 'next/head';
import Image from 'next/image'
import Container from '@components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import useSwr from 'swr'
import type { Evenement } from '@interfaces'
import { useRouter } from 'next/router';

import Select from "react-select";
import React, { useState, Component } from "react";

import { useSession, signIn, signOut } from "next-auth/react"

import { useEvenementContext } from "@context/evenement";


import InventairePostCard from '@components/InventairePostCard';

const superTitre = "Panier"
const superDescription = "Gestion du panier"

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

const Post = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data: session } = useSession()
  const router = useRouter()

  const { state, dispatch } = useEvenementContext();
  const { evenement, listeInventaire } = state

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

  const { id } = router.query
  const { data: unEvenement, error } = useSwr<Evenement>(`/api/gsheet/evenement/detail/${id}`, fetcher)
  if (error) {
    return <div>Erreur de chargement un truc</div>
  }

  const handleChooseEvenement = async (session, unEvenement:Evenement) => {
      // Stop the form from submitting and refreshing the page.

      if (unEvenement) {
        dispatch({type: 'evenement_choix', payload: unEvenement })
      }
      else {
        dispatch({type: 'evenement_reset' })
      }
    }


  // Handles the submit event on form submit.
  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    // Get data from the form.
    const data = {
      rowid: event.target.rowid.value,
      id: event.target.id.value,
      titre: event.target.titre.value,
      type: selectedType ? selectedType : defaultType.value,
      unite: selectedUnitee ? selectedUnitee : defaultUnite.value,
      status: selectedStatus ? selectedStatus : defaultStatus.value,
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
                  🛒 {unEvenement.titre}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  Ici on vérifie la liste de matos pour un évenement
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <form className="flex flex-col text-gray-700 dark:text-gray-300" onSubmit={handleSubmit}>
                    <div className="w-full flex flex-col text-gray-700 dark:text-gray-300">
                      <label htmlFor="titre">ligne</label>
                      <div>
                        <input  className="w-20 bg-gray-200 rounded-lg shadow border p-2" type="text" id="rowid" name="rowid" defaultValue={unEvenement.rowid}  readOnly/>
                        <button className="w-20 rounded-lg border p-2" type="submit">💾</button>
                        <button className="w-20 rounded-lg border p-2" title="Deselection !" onClick={() => handleChooseEvenement(session, null)}>❌</button>{' '}
                      </div>
                      <label htmlFor="titre">ID</label>
                      <input className="bg-gray-200 w-full rounded-lg shadow border p-2" type="text" id="id" name="id" defaultValue={unEvenement.id} readOnly />
                    </div>

                    <label htmlFor="titre">Titre</label>
                    <input className="bg-gray-200 text-black w-full rounded-lg shadow border p-2" type="text" id="titre" name="titre" defaultValue={unEvenement.titre} required />

                    <label htmlFor="type">Type</label>
                    <div>
                      <Select isDisabled={ true } defaultValue={defaultType} options={Types} onChange={setHandleType}  />
                    </div>

                    <label htmlFor="unite">Unité</label>
                    <div>
                      <Select isDisabled={ true }  defaultValue={defaultUnite} options={Unites} onChange={setHandleUnitee}  />
                    </div>

                    <label htmlFor="status">Status</label>
                    <div>
                      <Select defaultValue={defaultStatus} options={Status} onChange={setHandleStatus}  />
                    </div>
                  </form>

                  <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                    {listeInventaire.map((inventaire) => (
                      //if ( inputs.searchName === "toto") {
                        <InventairePostCard
                          unInventaire={inventaire}
                        />
                      //}
                    ))}
                   </div>
                </p>
              </div>

            </div>
            <div className="prose dark:prose-dark w-full">ça c'est un panier pour l'evenement</div>
          </article>
        </Container> )
  }
}

export default Post
