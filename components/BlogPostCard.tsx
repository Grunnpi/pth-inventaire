import Link from 'next/link';
import useSWR from 'swr';
import cn from 'classnames';

import Image from 'next/image'

import { useEvenementContext } from "../context/evenement";

export default function BlogPostCard({ title, slug, gradient, the_type, url_image }) {
  const [evenement, setEvenement, listeInventaire, setListeInventaire] = useEvenementContext();

  return (
    <Link
      href={`/${the_type}/detail/${slug}`}
      className={cn(
        'transform hover:scale-[1.01] transition-all',
        'rounded-xl w-full  md:w-1/1 bg-gradient-to-r p-1',
        gradient
      )}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex flex-col md:flex-row justify-between">
          <h4 className="text-lg md:text-lg font-medium mb-6 sm:mb-10 w-full text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h4>
        </div>
        <div className="flex items-center text-gray-800 dark:text-gray-200">
          <button
            aria-label="Ajout au chariot"
            type="button"
            className="w-16 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center hover:ring-2 ring-gray-300  transition-all"
            onClick={(e) => {
               alert("click ici")
                e.preventDefault();
              }
            }
          >➕🛒</button>
          <Image className=""
              src={url_image}
              alt="Pas d'image"
              width="60"
              height="60"
            />
        </div>
      </div>
    </Link>
  );
}
