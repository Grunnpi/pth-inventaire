import Head from 'next/head';
import Image from 'next/image'
import Container from '@components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import useSwr from 'swr'
import type { Evenement, Inventaire, Materiel_par_evenement, Requete_suppression } from '@interfaces'
import { useRouter } from 'next/router';

import Select from "react-select";
import React, { useState, Component } from "react";

import { useSession, signIn, signOut } from "next-auth/react"

import { useEvenementContext } from "@context/evenement";


import InventairePostCard from '@components/InventairePostCard';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css


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
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

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

      const response = await fetch(`/api/gsheet/materiel_par_evenement/liste`);
      if (response.status == 200) {
        const result = await response.json()
        var maListeInventaire = []
        result.forEach(async unLien => {
          if ( unLien.id_evenement == unEvenement.id ) {
            const responseInventaire = await fetch(`/api/gsheet/inventaire/detail/${unLien.rowid_materiel}`);
            if (responseInventaire.status == 200 ) {
              const unInventaire = await responseInventaire.json()
              maListeInventaire.push(unInventaire)
            }
          }
        })
        dispatch({type: 'inventaire_set', payload: maListeInventaire })
        dispatch({type: 'panier_synchro_etat', payload: true })
        router.push(`/evenement/detail/${unEvenement.rowid}`)

      }
    }
    else {
      dispatch({type: 'evenement_reset' })
      dispatch({type: 'inventaire_reset' })
    }
  }


  // Handles the submit event on form submit.
  const handleSauveEvenement = async (event) => {
    // Get data from the form.
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()
    setSauvegardeEnCours(true)

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
        setSauvegardeEnCours(false)
        router.push('/evenement/detail/' + result.newid)
      }
    }
    else {
      if ( response.status != 200 ) {
        alert("Erreur sauvegarde evenement " + response.status)
      }
    }

    // save ok, on va sauver l'inventaire si c'est le panier courant
    if ( evenement && event.target.id.value == evenement.id ) {
      // on veut mettre à jour les liens, mais pour éviter spam api google (qui est limité)
      // #1 > en 1 appel pour lister tous les liens
      // #2 > vérifier si liens sont triés (sur evenement id)
      // #3.a > si triés par evenement, on supprimer la plage avec ceux du l'evenement courant puis ajout ceux de l'evenement courant
      // #3.b > si pas triés, on fait un tri/filtre evenement puis sauve tout

      const responseTousLesLiens = await fetch("/api/gsheet/materiel_par_evenement/liste")
      if (responseTousLesLiens.status == 200 || responseTousLesLiens.status == 404) {
        const resultTousLesLiens = await responseTousLesLiens.json()
        //alert("on trouve " + resultTousLesLiens.length + ' liens')

        // #2 trie et on garde les index pour evenement courant
        var listeLiensEstTriee = true // par défaut, genre si c'est vide
        var id_evenement_precedent = null
        var liste_id_evenement_precedent = []
        var rowid_evenement_courant_debut = null
        var rowid_evenement_courant_fin = null
        if ( resultTousLesLiens.length >  0 ) {
          resultTousLesLiens.forEach(async unLien => {
            // ordre ?
            if (id_evenement_precedent == null) {
              id_evenement_precedent = unLien.id_evenement
            } else {
              if ( id_evenement_precedent == unLien.id_evenement ) {
                // on reste trié jusque là
              } else {
                if ( liste_id_evenement_precedent.includes(unLien.id_evenement) ) {
                  // déjà eu celui ci par le passé : c'est pas trié :(
                  listeLiensEstTriee = false
                }
                else {
                  // on change d'id, et le nouveau à priori pas unsorted
                  id_evenement_precedent = unLien.id_evenement
                }
                liste_id_evenement_precedent.push(unLien.id_evenement)
              }
            }

            // on garde trace debut/fin pour evt courant
           // alert("compare " + unLien.id_evenement + " === " + evenement.id_evenement )
            if ( unLien.id_evenement === evenement.id ) {
              if ( rowid_evenement_courant_debut === null ) {
                rowid_evenement_courant_debut = unLien.rowid
                rowid_evenement_courant_fin = unLien.rowid
              }
              else {
                rowid_evenement_courant_fin = unLien.rowid
              }
            }
          })
        }

        //alert("Trié[" + listeLiensEstTriee + "] debut=" + rowid_evenement_courant_debut + "/fin=" + rowid_evenement_courant_fin )
        if ( listeLiensEstTriee ) {
          // #3.a > suppression des lignes pour evenement seulement
          if ( rowid_evenement_courant_debut !== null && rowid_evenement_courant_fin !== null ) {
            // Get data from the form.
            const requeteSuppression:Requete_suppression = {}
            requeteSuppression.type_suppression = "multiple"
            requeteSuppression.rowid_debut = rowid_evenement_courant_debut
            requeteSuppression.rowid_fin = rowid_evenement_courant_fin

            // Send the data to the server in JSON format.
            const JSONdata = JSON.stringify(requeteSuppression)

            // API endpoint where we send form data.
            const endpoint = '/api/gsheet/materiel_par_evenement/supprimer'

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
            if (response.status == 200) {
               //alert('suppression anciens liens')
            }
          }
        } else {
          setSauvegardeEnCours(false)
          alert("pas trié !? - abort")
          return
        }
      }
      else {
        setSauvegardeEnCours(false)
        alert('erreur lors #1 - abort ' + responseTousLesLiens.status)
        return
      }

      var materiel_par_evenement_liste:Materiel_par_evenement[] = []
      listeInventaire.forEach(async unInventaire => {
        const materiel_par_evenement:Materiel_par_evenement = {
          rowid_evenement: '=EQUIV(INDIRECT("B" & LIGNE());Evenement!A:A;0)',
          id_evenement: evenement.id,
          nom_evenement: '=RECHERCHEV(INDIRECT("B" & LIGNE());Evenement!A:E;2;FAUX)',
          rowid_materiel: '=EQUIV(INDIRECT("E" & LIGNE());Matériel!A:A;0)',
          id_materiel: unInventaire.id,
          nom_materiel: '=RECHERCHEV(INDIRECT("E" & LIGNE());\'Matériel\'!A:M;4;FAUX)'
        }
        materiel_par_evenement_liste.push(materiel_par_evenement)
      })

      // Send the data to the server in JSON format.
      const JSONdata = JSON.stringify(materiel_par_evenement_liste)

      // API endpoint where we send form data.
      const endpoint = '/api/gsheet/materiel_par_evenement/batch_insert'

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
      dispatch({type: 'panier_synchro_etat', payload: true })
      setSauvegardeEnCours(false)
    }
    else {
      setSauvegardeEnCours(false)
    }
  }

  const handleDeleteEvenement = async (session, unEvenement:Evenement) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    // Get data from the form.
    const requeteSuppression:Requete_suppression = {}
    requeteSuppression.type_suppression = "unique"
    requeteSuppression.rowid_unique = unEvenement.rowid

    // Send the data to the server in JSON format.
    const JSONdata = JSON.stringify(requeteSuppression)

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
    if (response.status == 200) {
       router.push('/evenement')
    }
  }

  const handleDelete = async (session, unEvenement:Evenement) => {
    var retourOui = false
    const options = {
      title: "Sûr de vouloir supprimer cet évenement ?!",
      message: "un si bel évenement....",
      buttons: [
        {
          label: 'Oui quand même',
          onClick: () => handleDeleteEvenement(session, unEvenement)
        },
        {
          label: 'Oh ben non',

        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      keyCodeForClose: [8, 32],
      willUnmount: () => {},
      afterClose: () => {},
      onClickOutside: () => {},
      onKeypress: () => {},
      onKeypressEscape: () => {},
      overlayClassName: "overlay-custom-class-name",
    };

    confirmAlert(options);

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
          <article className={sauvegardeEnCours?"cursor-progress flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full":"flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full"}>
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {evenement && unEvenement.id == evenement.id?'🛒':' '} {unEvenement.titre}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  Ici on vérifie la liste de matos pour un évenement
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <form onSubmit={handleSauveEvenement}>
                    <div className="flex flex-col text-gray-700 dark:text-gray-300">
                      <div className="w-full flex flex-col text-gray-700 dark:text-gray-300">
                        <label htmlFor="titre">ligne</label>
                        <div>
                          <input  className="w-20 bg-gray-200 rounded-lg shadow border p-2" type="text" id="rowid" name="rowid" defaultValue={unEvenement.rowid}  readOnly/>{evenement?' ':'-'}
                          <button className={sauvegardeEnCours?"animate-spin w-20 rounded-lg border p-2":"w-20 rounded-lg border p-2"} type="submit" title="Sauve la selection" >💾</button> {evenement?' ':'-'}
                          <button className="w-20 rounded-lg border p-2" type="button" title={evenement && unEvenement.id == evenement.id?'déselection':'selection'} onClick={() => { handleChooseEvenement(session, evenement && unEvenement.id == evenement.id?null:unEvenement)}}>{evenement && unEvenement.id == evenement.id?'❌':'✅'}</button>
                          <button className="w-20 rounded-lg border p-2" type="button" title="suppression" onClick={() => handleDelete(session, unEvenement)}>🗑</button>{' '}
                        </div>
                        <label htmlFor="titre">ID</label>
                        <input className="bg-gray-200 w-full rounded-lg shadow border p-2" type="text" id="id" name="id" defaultValue={unEvenement.id}  />
                      </div>

                      <label htmlFor="titre">Titre</label>
                      <input className="bg-gray-200 text-black w-full rounded-lg shadow border p-2" type="text" id="titre" name="titre" defaultValue={unEvenement.titre} required />

                      <label htmlFor="type">Type</label>
                      <div>
                        <Select isDisabled={ false } defaultValue={defaultType} options={Types} onChange={setHandleType}  />
                      </div>

                      <label htmlFor="unite">Unité</label>
                      <div>
                        <Select isDisabled={ false }  defaultValue={defaultUnite} options={Unites} onChange={setHandleUnitee}  />
                      </div>

                      <label htmlFor="status">Status</label>
                      <div>
                        <Select defaultValue={defaultStatus} options={Status} onChange={setHandleStatus}  />
                      </div>
                    </div>
                  </form>

                  <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                    {evenement && unEvenement.id == evenement.id && listeInventaire.map((inventaire) => (
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
