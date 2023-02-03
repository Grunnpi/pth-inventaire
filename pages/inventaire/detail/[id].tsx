import Link from 'next/link';
import cn from 'classnames';

import Head from 'next/head';
import Image from 'next/image'
import Container from '@components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import { useSession, signIn, signOut } from "next-auth/react"

import useSwr from 'swr'
import type { Inventaire } from '@interfaces'
import { useRouter } from 'next/router';

import Select from "react-select";
import CreatableSelect from 'react-select/creatable';

import Zoom from "next-image-zoom";

import { useState, useEffect  } from "react";

import { Familles, Types, Etats } from "@interfaces/constants.js"

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

const Post = () => {
  const { data: session } = useSession()

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const router = useRouter()
  const { id } = router.query
  const { data: unInventaire, error } = useSwr<Inventaire>(`/api/gsheet/inventaire/detail/${id}`, fetcher)
  if (error) return <div>Erreur de chargement un truc</div>

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  const [voirImage, setVoirImage] = useState(false);
  const [voirPleinEcran, setVoirPleinEcran] = useState(false);


  const [selectedFamille, setSelectedFamille] = useState(null);
  const setHandleFamille = (e) => {
    setSelectedFamille(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [selectedType, setSelectedType] = useState(null);
  const setHandleType = (e) => {
    if (e) {
      setSelectedType(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
    } else {
      setSelectedType(null)
    }
  };

  const [selectedEtat, setSelectedEtat] = useState(null);
  const setHandleEtat = (e) => {
    setSelectedEtat(Array.isArray(e) ? e.map((hotel) => hotel.label) : e.value);
  };

  const [commentaire, setCommentaire] = useState('');
  const handleCommentaireChange = event => {
    setCommentaire(event.target.value);
  };

  const [marquage, setMarquage] = useState('');
  const handleMarquageChange = event => {
    setMarquage(event.target.value);
  };

  var defaultFamille = Types.find(c => c.value == "Tente")
  var defaultType = Types.find(c => c.value == "")
  var defaultTypeValue
  var defaultEtat = Etats.find(c => c.value == "Bon")

  // Handles the submit event on form submit.
    const handleSubmit = async (event) => {
      // Stop the form from submitting and refreshing the page.
      event.preventDefault()

      // Get data from the form.
      const data = {
        rowid: event.target.rowid.value,
        id: event.target.rowid.value,
        famille: selectedFamille ? selectedFamille : defaultFamille.value,
        type: selectedType ? selectedType : defaultType.value,
        nom: event.target.nom.value,
        imageid: event.target.imageid.value,
        image_visu: '=IMAGE(INDIRECT("N" & LIGNE()))',
        marquage: marquage,
        commentaire: commentaire,
        localisation: event.target.localisation.value,
        etat: selectedEtat ? selectedEtat : defaultEtat.value,
        date_etat: event.target.date_etat.value,
        date_arrivee: event.target.date_arrivee.value,
        origine: event.target.origine.value,
        image_url: '=RECHERCHEV(INDIRECT("E" & LIGNE());Image!A:E;5;FAUX)'
      }

      // Send the data to the server in JSON format.
      const JSONdata = JSON.stringify(data)

      // API endpoint where we send form data.
      const endpoint = event.target.rowid.value ==="nouveau" ? '/api/gsheet/inventaire/nouveau' : '/api/gsheet/inventaire/update'

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
           router.push('/inventaire/detail/' + result.newid)
        }
      }
    }

    // Handles the submit event on form submit.
      const handleDelete = async (session, unInventaire:Inventaire) => {

        alert("Bloqué pour l'instant")
        if (false) {
          // Stop the form from submitting and refreshing the page.
          event.preventDefault()

          // Get data from the form.
          const data = unInventaire

          // Send the data to the server in JSON format.
          const JSONdata = JSON.stringify(data)

          // API endpoint where we send form data.
          const endpoint = '/api/gsheet/inventaire/supprimer'

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
             router.push('/inventaire')
          }
        }
      }

   useEffect(() => {
      if(unInventaire){
        setCommentaire(unInventaire.commentaire);
        setMarquage(unInventaire.marquage);
      }
    }, [unInventaire]);


  if (!unInventaire) {
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
      defaultFamille = Familles.find(c => c.value == unInventaire.famille)
      defaultType = Types.find(c => c.value == unInventaire.type)
      if (!defaultType) {
        defaultType = {value:unInventaire.type, label:unInventaire.type}
        defaultTypeValue = {value:unInventaire.type, label:unInventaire.type}
      } else {
        defaultTypeValue = {value:defaultType.value, label:defaultType.label}
      }
      defaultEtat = Etats.find(c => c.value == unInventaire.etat)


      if (voirImage) {
        const the_url = unInventaire.image_url ? unInventaire.image_url : "/images/profile.jpg"
        const the_alt = unInventaire.nom ? unInventaire.nom : "Pas d'image"

        return(<Container title={`PTH [${unInventaire.nom}]`}>
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {unInventaire.nom}
                </h1>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Clickez sur l'image pour revenir aux infos
                </p>

                <p className="text-gray-700 dark:text-gray-300">
                  <a href="#" onClick={() => setVoirImage(false)} >
                    <i class="bi bi-eye-slash"></i> Clickez sur l'image pour revenir aux infos
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="#" onClick={() => router.push(`/inventaire/detail/${id}/nouveau`)} >
                    <i class="bi bi-image"></i> Ajouter image
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="#" onClick={() => router.push('/inventaire')} >
                    ◀️ Revenir vers Inventaire
                  </a>
                </p>

                <div style={{position:(voirPleinEcran ? "static":"relative")}} className="w-full max-h-full place-content-center mt-2 sm:mt-0 rounded-lg shadow border p-2">
                    <a href="#" onClick={() => setVoirPleinEcran(!voirPleinEcran)}>
                      {voirPleinEcran ?
                        <Image
                            src={the_url}
                            alt={the_alt}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
                            fill
                            style={{objectFit:"contain"}}
                        />
                       :
                        <Image
                            src={the_url}
                            alt={the_alt}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
                            width={300}
                            height={300}
                            style={{objectFit:"contain"}}
                        />
                      }
                    </a>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-dark w-full">il n'y a plus rien en dessous</div>
          </article>
        </Container>)
      }
      else {
        const the_url = unInventaire.image_url ? unInventaire.image_url : "/images/profile.jpg"
        const the_alt = unInventaire.nom ? unInventaire.nom : "Pas d'image"

        return (<Container
            title={`PTH [${unInventaire.nom}]`}
            description="A collection of code snippets – including serverless functions, Node.js scripts, and CSS tricks."
          >
              <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
                <div className="flex justify-between w-full mb-8">
                  <div>
                    <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                      {unInventaire.nom}
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300">
                      <a href="#" onClick={() => router.push('/inventaire')} >
                        ◀️ Revenir vers Inventaire
                      </a>
                    </p>

                    <form className="flex flex-col text-gray-700 dark:text-gray-300" onSubmit={handleSubmit}>
                      <table className="flex flex-col w-full text-gray-700 dark:text-gray-300">
                      <tbody>
                        <tr>
                        <td>
                          <div className="w-full flex flex-col text-gray-700 dark:text-gray-300">
                            <label htmlFor="titre">ligne</label>
                            <div>
                              <input  className="w-20 bg-gray-200 rounded-lg shadow border p-2" type="text" id="rowid" name="rowid" defaultValue={unInventaire.rowid}  readOnly/>
                              <button className="w-20 rounded-lg border p-2" type="submit">💾</button>
                              <button className="w-20 rounded-lg border p-2" onClick={() => handleDelete(session, unInventaire)}>🗑️</button>{' '}
                            </div>
                            <label htmlFor="titre">ID</label>
                            <input className="bg-gray-200 w-full rounded-lg shadow border p-2" type="text" id="id" name="id" defaultValue={unInventaire.id}/>
                          </div>
                        </td>
                        <td>
                            <div style={{position:"relative"}} className="w-full truncate min-h-full h-full place-content-center md:w-48 mt-2 sm:mt-0 rounded-lg shadow border p-2">
                              <a href="#" onClick={() => setVoirImage(true)}>
                                <Image
                                    src={the_url}
                                    alt={the_alt}
                                    height={120}
                                    width={120}
                                    layout={"responsive"}
                                    placeholder="blur"
                                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(150, 150))}`}
                                />
                              </a>
                            </div>
                        </td>
                        </tr>
                      </tbody>
                      </table>
                      <div className="flex flex-row w-full text-gray-700 dark:text-gray-300">
                        <div className="w-1/2">
                          <label htmlFor="type">Famille</label>
                          <div>
                            <Select menuShouldScrollIntoView={false} menuPlacement="bottom" isSearchable={false} className="w-full" defaultValue={defaultFamille} options={Familles} onChange={setHandleFamille}  />
                          </div>
                        </div>
                        <div className="w-1/2">
                          <label htmlFor="status">Etat</label>
                          <div className="text-red-500 bg-gray-200 w-full rounded-lg">
                            <Select menuShouldScrollIntoView={false} menuPlacement="bottom" isSearchable={false} className="w-full" defaultValue={defaultEtat} options={Etats} onChange={setHandleEtat}  />
                          </div>
                        </div>
                      </div>

                      <label htmlFor="type">Type</label>
                      <div>
                        <CreatableSelect isClearable  defaultValue={defaultTypeValue} options={Types} onChange={setHandleType}  />
                      </div>
                      <label htmlFor="titre">Nom</label>
                      <input className="bg-gray-200 w-full rounded-lg shadow border p-2" type="text" id="nom" name="nom" defaultValue={unInventaire.nom} required />

                      <label>Commentaire</label>
                      <textarea
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        rows={3}
                        placeholder=""
                        name="commentaire"
                        id="commentaire"
                        value={commentaire}
                        onChange={handleCommentaireChange}
                        ></textarea>
                      <label>Marquage</label>
                      <textarea
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        rows={2}
                        placeholder=""
                        name="marquage"
                        id="marquage"
                        value={marquage}
                        onChange={handleMarquageChange}
                        ></textarea>
                      <label htmlFor="titre">Localisation</label>
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="text"
                        id="localisation"
                        name="localisation"
                        defaultValue={unInventaire.localisation}
                      />
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="hidden"
                        id="imageid"
                        defaultValue={unInventaire.imageid}
                      />
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="hidden"
                        id="image_visu"
                        defaultValue={unInventaire.image_visu}
                      />
                      <label htmlFor="titre">date_etat</label>
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="text"
                        id="date_etat"
                        defaultValue={unInventaire.date_etat}
                      />
                      <label htmlFor="titre">date_arrivee</label>
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="text"
                        id="date_arrivee"
                        defaultValue={unInventaire.date_arrivee}
                      />
                      <label htmlFor="titre">origine</label>
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="text"
                        id="origine"
                        defaultValue={unInventaire.origine}
                      />
                      <input
                        className="bg-gray-200 w-full rounded-lg shadow border p-2"
                        type="hidden"
                        id="image_url"
                        defaultValue={unInventaire.image_url}
                      />
                    </form>
                  </div>
                </div>
                <div className="prose dark:prose-dark w-full">il n'y a plus rien en dessous</div>
              </article>
          </Container> )
      }
  }
}

export default Post
