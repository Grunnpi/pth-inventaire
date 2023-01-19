import Link from 'next/link';

import Container from '@components/Container';
import InventairePostCard from '@components/InventairePostCard';

import useSwr from 'swr'
import type { Inventaire } from '@interfaces'

import PacmanLoader from "react-spinners/PacmanLoader";

import { useState } from "react";
const fetcher = (url: string) => fetch(url).then((res) => res.json())

import { Familles, Etats } from "@interfaces/constants.js"


export default function Home() {
  const { data: allPostsData, error } = useSwr<Inventaire[]>('/api/gsheet/inventaire/liste', fetcher)

  const [inputs, setInputs] = useState({
    searchName: "",
    searchAgeFrom: "",
    searchAgeTo: ""
  });

  const handleChange = event => {
    setInputs({
      ...inputs,
      [event.target.name]: event.target.value
    });
  };

  const toggleElement = (arr, val) =>
    arr.includes(val) ? arr.filter(el => el !== val) : [...arr, val];


  const FamillesValue = Familles.map((uneFamille) => ( uneFamille.value ))
  const [filtreFamille, setFiltreFamille] = useState(FamillesValue);
  const handleChangeFiltreFamille = (event) => {
    let the_value = event.target.getAttribute('name');
    const NewFamillesValue = toggleElement(filtreFamille,the_value)
    setFiltreFamille(NewFamillesValue)
  }

  const EtatsValue = Etats.map((unEtat) => ( unEtat.value != "HS" ? unEtat.value : "" ))
  const [filtreEtat, setFiltreEtat] = useState(EtatsValue);
  const handleChangeFiltreEtat = (event) => {
    let the_value = event.target.getAttribute('name');
    const NewEtatsValue = toggleElement(filtreEtat,the_value)
    setFiltreEtat(NewEtatsValue)
  }


  if (error) return <div>Erreur de chargement inventaire</div>
  if (!allPostsData) {
      return (
        <Container
            title="Inventaire"
            description="La gestion des tentes..."
          >
            <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Patience
              </h1>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                une application sur un hebergeur gratuit implique de grande patience
              </p>
              <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                  <PacmanLoader color="hsla(216, 67%, 53%, 1)" />
              </div>
            </div>
        </Container>
      );
  }
  else {
      return (
        <Container
            title="Inventaire"
            description="La gestion des tentes..."
          >
            <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Inventaire
              </h1>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Tout le matériel groupe. On peut filter par type (P8, Glacière, ...)
                et on va bien voir quelles autres gadgets on peut ajouter ici
              </p>
              <div className="flex flex-col max-w-screen">
                 <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row">
                     <input
                       name="searchName"
                       className="w-full rounded-lg shadow border p-2 sm:text-yellow-500 md:text-red-500 lg:text-green-500 xl:text-blue-500 2xl:text-pink-500"
                       type="text"
                       placeholder="Filtre sur nom de l'objet"
                       value={inputs.searchName}
                       onChange={handleChange}
                     />
                     <input
                       name="searchAgeFrom"
                       className="w-full rounded-lg shadow border p-2"
                       type="text"
                       placeholder="Filtre sur Type"
                       value={inputs.searchAgeFrom}
                       onChange={handleChange}
                     />
                 </div>
                 <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row">
                  <div>
                    {Familles.map((uneFamille) => (
                       filtreFamille.includes(uneFamille.value) ?
                        <button className="hover:ring-2 ring-gray-300  transition-all overflow-clip overflow-hidden align-text-top text-xs max-w-[20%] w-18 h-12 rounded-lg border" name={uneFamille.value} onClick={handleChangeFiltreFamille}>{uneFamille.label}</button>
                       :
                        <button className="hover:ring-2 ring-gray-300  transition-all overflow-clip overflow-hidden align-text-top text-xs max-w-[20%] w-18 h-12 rounded-lg border text-red-500" name={uneFamille.value} onClick={handleChangeFiltreFamille}>{uneFamille.label}</button>
                     ))
                    }
                  </div>
                  <div className="flex justify-center">
                   {Etats.map((unEtat) => (
                       filtreEtat.includes(unEtat.value) ?
                        <button className="hover:ring-2 ring-gray-300  transition-all align-text-top text-xs w-12 h-12 rounded-lg border" name={unEtat.value} onClick={handleChangeFiltreEtat}>{unEtat.label}</button>
                       :
                        <button className="hover:ring-2 ring-gray-300  transition-all align-text-top text-xs w-12 h-12 rounded-lg border text-red-500" name={unEtat.value} onClick={handleChangeFiltreEtat}>{unEtat.label}</button>
                     ))
                   }
                   </div>
                 </div>
               </div>

              <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                  {allPostsData.filter(
                      function (unInventaire) {
                        var onGarde = true
                        if ( inputs.searchName ) {
                          if (!(unInventaire.nom.toLowerCase().indexOf(`${inputs.searchName.toLowerCase()}`) >= 0  )) {
                            onGarde = false
                          }
                        }

                        if ( inputs.searchAgeFrom ) {
                          if (!(unInventaire.type.toLowerCase().indexOf(`${inputs.searchAgeFrom.toLowerCase()}`) >= 0  )) {
                            onGarde = false
                          }
                        }

                        if ( !filtreFamille.includes(unInventaire.famille)) {
                          onGarde = false
                        }
                        if ( !filtreEtat.includes(unInventaire.etat)) {
                          onGarde = false
                        }

                        if (onGarde) {
                          return unInventaire
                        }
                    }).map((inventaire) => (
                      //if ( inputs.searchName === "toto") {
                        <InventairePostCard unInventaire={inventaire}
                          /*
                          title={inventaire.nom}
                          slug={inventaire.id}
                          url_image={inventaire.image_url}
                          //gradient="from-[#D8B4FE] to-[#818CF8]"
                          gradient="from-[#0000FF] to-[#6EE7B7]"
                          the_api="inventaire"
                          the_famille={inventaire.famille}
                          the_type={inventaire.type}
                          the_etat={inventaire.etat}
                          */
                        />
                      //}
                  ))}
              </div>
            </div>
        </Container>
      );
  }
}
