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

import AlertConfirm, { Button } from 'react-alert-confirm';
import "react-alert-confirm/lib/style.css";


const superTitre = "Evenement"
const superDescription = "Gestion d'un evenement"

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

  const [evenement, setEvenement] = useEvenementContext();
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
        alert(`Selection de : ${unEvenement.titre}`)
      }
      else {
        alert(`Deselection !`)
      }
      setEvenement(unEvenement)
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
    const endpoint = event.target.id.value ==="nouveau" ? '/api/gsheet/evenement/nouveau' : '/api/gsheet/evenement/update'

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
    if (event.target.id.value ==="nouveau") {
      if (response.status == 307) {
         router.push('/evenement/detail/' + result.newid)
      }
    }
    else {
      alert(`Mise à jour : ${result.message}`)
    }
  }

  // Handles the submit event on form submit.
    const handleDelete = async (session, unEvenement:Evenement) => {


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
                    <label htmlFor="titre">ligne</label>
                    <input type="text" id="rowid" name="rowid" defaultValue={unEvenement.rowid}  readOnly/>
                    <label htmlFor="titre">ID</label>
                    <input type="text" id="id" name="id" defaultValue={unEvenement.id}/>

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

                    <button type="submit">💾 Sauver</button>
                  </form>
                  <span className="flex flex-col justify-center text-gray-500 hover:text-gray-600">
                    <button onClick={() => handleDelete(session, unEvenement)}>🗑 Supprimer️</button>{' '}
                  </span>
                  <span className="flex flex-col justify-center text-gray-500 hover:text-gray-600">
                    <button onClick={() => handleChooseEvenement(session, unEvenement)}>✅ choisir️</button>{' '}
                  </span>
                  <span className="flex flex-col justify-center text-gray-500 hover:text-gray-600">
                    <button onClick={() => handleChooseEvenement(session, null)}>❌ supprimer selection</button>{' '}
                  </span>
                </p>
              </div>

            </div>
            <div className="prose dark:prose-dark w-full">ça c'est un evenement</div>
          </article>
        </Container> )
  }
}

export default Post
