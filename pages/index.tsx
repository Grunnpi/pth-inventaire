import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Container from '../components/Container';

import { useSession, signIn, signOut } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()
  console.log("Home : session")
  console.log(session)
  if (session) {
      return (
        <Container>
          <div className="flex flex-col justify-center items-start max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
            <div className="flex flex-col-reverse sm:flex-row items-start">
              <div className="flex flex-col pr-8">
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-1 text-black dark:text-white">
                  SGDF PTH Inventaire
                </h1>
                <h2 className="text-gray-700 dark:text-gray-200 mb-4">
                  🤝 inventaire à jour 😘
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-16">
                  La joie et le bonheur d'avoir un inventaire
                  à jour et partagé par toute la team.
                </p>
              </div>
              <div className="w-[80px] sm:w-[176px] relative mb-8 sm:mb-0 mr-auto">
                <Image
                  alt="SGDF"
                  height={176}
                  width={176}
                  src="/images/SGDF.png"
                  sizes="30vw"
                  priority
                  className="rounded-full filter"
                />
              </div>
            </div>

            <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-black dark:text-white">
                On fait quoi ici ?
            </h3>

            <div className="flex gap-6 flex-col md:flex-row">

              <div className={styles.grid}>
                <a href="/evenement" className={styles.card}>
                  <h2>📆 Evenement &rarr;</h2>
                  <p>Gestion d'un week-end ou un evenement</p>
                </a>

                <a href="/tente" className={styles.card}>
                  <h2>🏕️ Tentes &rarr;</h2>
                  <p>Liste des tentes du groupe et de leur détails</p>
                </a>

                <a href="/matos" className={styles.card}>
                  <h2>🍳 Matos &rarr;</h2>
                  <p>Les gamelles, le froissartage, etc !</p>
                </a>

                <a href="/autre" className={styles.card}>
                  <h2>❓🌂 Autre &rarr;</h2>
                  <p>
                    Puisqu'il faut bien mettre le reste quelque part.
                  </p>
                </a>
              </div>
            </div>
          </div>
          </Container>
        )
    }
    return (
        <Container>
              <div className="flex flex-col justify-center items-start max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
                <div className="flex flex-col-reverse sm:flex-row items-start">
                  <div className="flex flex-col pr-8">
                    <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-1 text-black dark:text-white">
                      SGDF PTH Inventaire
                    </h1>
                    <h2 className="text-gray-700 dark:text-gray-200 mb-4">
                      ici, c'est une propriété privée
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-16">
                      La joie et le bonheur d'avoir un inventaire
                      à jour et partagé par toute la team.
                    </p>
                  </div>
                  <div className="w-[80px] sm:w-[176px] relative mb-8 sm:mb-0 mr-auto">
                    <Image
                      alt="SGDF"
                      height={176}
                      width={176}
                      src="/images/SGDF.png"
                      sizes="30vw"
                      priority
                      className="rounded-full filter"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-black dark:text-white">
                    Mais alors ?
                </h3>

                <div className="flex gap-6 flex-col md:flex-row">
                  <button onClick={() => signIn()}>↩️ Connecte toi</button>
                </div>
              </div>
              </Container>
            )

}
