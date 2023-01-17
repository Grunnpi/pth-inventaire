import Link from 'next/link';
import useSWR from 'swr';
import cn from 'classnames';

import Image from 'next/image'

import { Familles, Etats } from "@interfaces/constants.js"

import { useEvenementContext } from "@context/evenement";


export default function InventairePostCard({ title, slug, gradient, the_api, url_image, the_famille, the_etat, the_type }) {
  const { state, dispatch } = useEvenementContext();
  const { evenement, listeInventaire } = state

  const handleViewPanier = (e) => {
     if ( evenement ) {
        dispatch({type: 'inventaire_ajout', payload: slug })
     }
     e.preventDefault();
  }

  return (
    <Link
      href={`/${the_api}/detail/${slug}`}
      className={cn(
        'transform hover:scale-[1.01] transition-all',
        'rounded-xl w-full  bg-gradient-to-r p-1',
        gradient
      )}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex flex-col justify-between">
          <h4 className="text-lg md:text-lg font-medium w-full text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {the_type}
          </p>
          <div>
            <span>{Familles.find(c => c.value == the_famille).label.substring(0,2)}</span>
            /
            <span>{Etats.find(c1 => c1.value == the_etat).label.substring(0,2)}</span>
          </div>
        </div>
        <div className="flex flex-row items-center text-gray-800 dark:text-gray-200">
          <div className="w-2/3 h-full truncate place-content-center mt-2 rounded-lg shadow border p-2">
            <Image className=""
              src={url_image}
              alt="Pas d'image"
              width="60"
              height="60"
            />
          </div>
          <button
            aria-label="Ajout au chariot"
            type="button"
            className="w-16 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300  transition-all"
            onClick={(e) => handleViewPanier(e)}
          >➕🛒</button>
        </div>
      </div>
    </Link>
  );
}
