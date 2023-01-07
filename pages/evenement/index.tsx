import Link from 'next/link';

import Container from '../../components/Container';
import BlogPostCard from '../../components/BlogPostCard';

import useSwr from 'swr'
import type { Evenement } from '../../interfaces'

import PacmanLoader from "react-spinners/PacmanLoader";


const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const { data: allPostsData, error } = useSwr<Evenement[]>('/api/gsheet/evenement/liste', fetcher)

  if (error) return <div>Erreur de chargement inventaire</div>
  if (!allPostsData) {
      return (
        <Container
            title="Evenement"
            description="La gestion des tentes..."
          >
            <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Evenement
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
            title="Evenement"
            description="La gestion des tentes..."
          >
            <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Evenement
              </h1>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Tous les evenements du groupe. (week-end, journée, camp, ...)
                On crée un nouvel évenement pour planifier le matériel, puis le jour J on marque ce qui est pris
                et enfin en fin, on marque ce qui revient et dans quel état
              </p>
              <a href="/evenement/detail/nouveau" >
                <p> 📆 Créer un nouvel Evenement &rarr;</p>
              </a>
              <div className="grid w-full grid-cols-1 gap-4 my-2 mt-4 sm:grid-cols-2">
                  {allPostsData.map((evenement) => (
                      <BlogPostCard
                        title={evenement.titre}
                        slug={evenement.rowid}
                        //gradient="from-[#D8B4FE] to-[#818CF8]"
                        gradient="from-[#0000FF] to-[#6EE7B7]"
                        the_type="evenement"
                      />
                  ))}
              </div>
            </div>
        </Container>
      );
  }
}
