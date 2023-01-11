import Link from 'next/link';

import Container from '../../components/Container';
import BlogPostCard from '../../components/BlogPostCard';

import useSwr from 'swr'
import type { Inventaire } from '../../interfaces'

import PacmanLoader from "react-spinners/PacmanLoader";

import { useState } from "react";
const fetcher = (url: string) => fetch(url).then((res) => res.json())


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



  if (error) return <div>Erreur de chargement inventaire</div>
  if (!allPostsData) {
      return (
        <Container
            title="Inventaire"
            description="La gestion des tentes..."
          >
            <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Tentes
              </h1>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Toutes les tentes du groupe. On peut filter par type (P8, P6, Marabout, ...)
                et on va bien voir quelles autres gadgets on peut ajouter ici
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
                Toutes les tentes du groupe. On peut filter par type (P8, P6, Marabout, ...)
                et on va bien voir quelles autres gadgets on peut ajouter ici
              </p>
                      <div className="form-group col-md-8">
                        <input
                          name="searchName"
                          type="text"
                          className="form-control"
                          placeholder="Name or MiddleName"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group col-md-2">
                        <input
                          name="searchAgeFrom"
                          type="number"
                          className="form-control"
                          placeholder="Age From"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group col-md-2">
                        <input
                          name="searchAgeTo"
                          type="number"
                          className="form-control"
                          placeholder="Age To A"
                          onChange={handleChange}
                        />
                      </div>
              <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                  {allPostsData.filter(
                      function (unInventaire) {
                        if ((unInventaire.nom.toLowerCase().indexOf(`${inputs.searchName.toLowerCase()}`) > 0 || unInventaire.id == "4" || `${inputs.searchAgeFrom}` == '-1')) {
                          return unInventaire
                        }
                    }).map((inventaire) => (
                      //if ( inputs.searchName === "toto") {
                        <BlogPostCard
                          title={inventaire.nom}
                          slug={inventaire.id}
                          //gradient="from-[#D8B4FE] to-[#818CF8]"
                          gradient="from-[#0000FF] to-[#6EE7B7]"
                          the_type="inventaire"
                        />
                      //}
                  ))}
              </div>
            </div>
        </Container>
      );
  }
}
