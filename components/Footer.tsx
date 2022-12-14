import Link from 'next/link';
import Image from 'next/image';

const ExternalLink = ({ href, children }) => (
  <a
    className="text-gray-500 hover:text-gray-600 transition"
    target="_blank"
    rel="noopener noreferrer"
    href={href}
  >
    {children}
  </a>
);
import { useSession, signIn, signOut } from "next-auth/react"

export default function Footer() {
  const { data: session } = useSession()
  const isSession = session ? true:false
  return (
    <footer className="flex flex-col justify-center items-start max-w-2xl mx-auto w-full mb-8">
      <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
      <div className="w-full max-w-2xl grid grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
        <div className="flex flex-col space-y-4">
          { isSession ? (
                <span className="text-gray-500 hover:text-gray-600 transition">
                  <button onClick={() => signOut()}>⏏️</button>{' '}{session.user.name}
                </span>
          ):( "" ) }
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-600 transition"
          >
            Base
          </Link>
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://analytiscout.sgdf.fr/">
            Analytiscout
          </ExternalLink>
          <ExternalLink href="https://intranet.sgdf.fr/">Intranet</ExternalLink>
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://comptaweb.sgdf.fr/">
            ComptaWeb
          </ExternalLink>
          <ExternalLink href="https://sites.sgdf.fr/pays-thionvillois/">
            Site/Blog du groupe
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}
