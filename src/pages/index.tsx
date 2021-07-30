import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/styles.module.scss';
import imageBoardUser from '../../public/images/board-user.svg';
import ImageAuto from '../components/ImageAuto';
import { GetStaticProps } from 'next';
import firebase from '../services/firebaseConnection';

type Data = {
  id: string,
  donate: boolean,
  lastDonate: Date,
  image: string
}

interface HomeProps{
  data: string
}

export default function Home({ data }: HomeProps) {

  const [donaters, setDonaters] = useState<Data[]>(JSON.parse(data));

  return (
    <>
      <Head>
        <title>Board - Organizando suas tarefas.</title>
      </Head>
      <main className={styles.contentContainer}>
        
        <ImageAuto src={imageBoardUser} alt="Ferramenta board" width="500px"/>

        <section className={styles.callToAction}>
          <h1>Uma ferramenta para seu dia a dia. Escreva, planeje e organize-se...</h1>
          <p>
            <span>100% Gratuita</span> e online
          </p>
        </section>

        { donaters.length && <h3>Apoiadores:</h3> }

        <div className={styles.donaters}>

          { donaters.map(item => (
            <ImageAuto classNameContainer={styles.donatersImage} src={item.image} alt="Foto do Apoiador" key={item.id}/>
          )) }

        </div>
        
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const donaters = await firebase.firestore().collection('users').get();

  const data = JSON.stringify(donaters.docs.map( u => {
    return {
      id: u.id,
      ...u.data()
    };
  }))

  return {
    props: {
      data
    },
    revalidate: 60 * 60 // Renderização a cada 60 minutos
  };

}
