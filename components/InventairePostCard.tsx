import Link from 'next/link';
import useSWR from 'swr';
import cn from 'classnames';

import Image from 'next/image'

import { Familles, Etats } from "@interfaces/constants.js"

import { useEvenementContext } from "@context/evenement";
import type { Inventaire } from '@interfaces'

//{ title, slug, gradient, the_api, url_image, the_famille, the_etat, the_type }
export default function InventairePostCard( {unInventaire} ) {
  const { state, dispatch } = useEvenementContext();
  const { evenement, listeInventaire } = state

  const handleViewPanierAjout = (e) => {
     if ( evenement ) {
        dispatch({type: 'inventaire_ajout', payload: unInventaire })
     }
     e.preventDefault();
  }
  const handleViewPanierRetire = (e) => {
     if ( evenement ) {
        dispatch({type: 'inventaire_retire', payload: unInventaire })
     }
     e.preventDefault();
  }

  return (
    <Link
      href={`/inventaire/detail/${unInventaire.rowid}`}
      className={cn(
        'transform hover:scale-[1.01] transition-all',
        'rounded-xl w-full  bg-gradient-to-r p-1',
        "from-[#0000FF] to-[#6EE7B7]"
      )}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex flex-col justify-between">
          <h4 className="text-lg md:text-lg font-medium w-full text-gray-900 dark:text-gray-100 tracking-tight">
            {unInventaire.nom}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {unInventaire.type}
          </p>
          <div>
            <span>{Familles.find(c => c.value == unInventaire.famille) ? Familles.find(c => c.value == unInventaire.famille).label.substring(0,2) : "?"}</span>
            /
            <span>{Etats.find(c1 => c1.value == unInventaire.etat) ? Etats.find(c1 => c1.value == unInventaire.etat).label.substring(0,2) : "?"}</span>
          </div>
        </div>
        <div className="flex flex-row items-center text-gray-800 dark:text-gray-200">
          <div className="w-2/3 h-full truncate place-content-center mt-2 rounded-lg shadow border p-2">
            <Image className=""
              src={unInventaire.image_url}
              alt="Pas d'image"
              width="60"
              height="60"
            />
          </div>
          {listeInventaire.includes(unInventaire) ?
            <button
              aria-label="Ajout au chariot"
              type="button"
              className="w-16 h-9 fill-green-700 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300  transition-all"
              onClick={(e) => handleViewPanierRetire(e)}
            ><i class="bi bi-cart-check text-green-500 fill-current"></i></button>
            :
            <button
              aria-label="Ajout au chariot"
              type="button"
              className="w-16 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300  transition-all"
              onClick={(e) => handleViewPanierAjout(e)}
            ><i class="bi bi-box-arrow-in-right text-blue-500 fill-current"></i><i class="bi bi-cart text-blue-500 fill-current"></i></button>
          }
        </div>
      </div>
    </Link>
  );
}
