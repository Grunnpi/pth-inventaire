import Link from 'next/link';
import useSWR from 'swr';
import cn from 'classnames';

import Image from 'next/image'

import { useEvenementContext } from "../context/evenement";

import { Familles, Etats } from "@interfaces/constants.js"


export default function EvenementPostCard({ title, slug, gradient, the_api }) {
  const { state, dispatch } = useEvenementContext();
  const { evenement, listeInventaire } = state

  return (
    <Link
      href={`/${the_api}/detail/${slug}`}
      className={cn(
        'transform hover:scale-[1.01] transition-all',
        'rounded-xl w-full md:w-1/1 bg-gradient-to-r p-1',
        gradient
      )}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex flex-col justify-between">
          <h4 className="text-lg md:text-lg font-medium w-full text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">

          </p>
        </div>
        <div className="flex flex-row items-center text-gray-800 dark:text-gray-200">
        </div>
      </div>
    </Link>
  );
}
