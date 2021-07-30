import Head from 'next/head';
import styles from './styles.module.scss';
import imageRocket from '../../../public/images/rocket.svg';
import ImageAuto from '../../components/ImageAuto';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { PayPalButtons } from '@paypal/react-paypal-js';
import firebase from '../../services/firebaseConnection';
import { useState } from 'react';

interface DonateProps{
  user: {
    name: string,
    id: string,
    image: string,
  }
}

export default function Donate({ user }: DonateProps) {
  
  const [vip, setVip] = useState(false);

  async function handleSaveDonate( ) {
    await firebase.firestore().collection('users')
      .doc(user.id)
      .set({
        donate: true,
        lastDonate: new Date(),
        image: user.image
      }).then((res) => {

        setVip(true);

      });
  }

  return (
    <>
      <Head>
        <title>Ajude a plataforma board ficar online!</title>
      </Head>
      <main className={styles.container}>

        <ImageAuto src={imageRocket} width="500px" alt="Seja um apoiador"/>

        { vip && (
          <div className={styles.vip}>
            <ImageAuto src={user.image} alt="Foto de perfil do usuário" width="50px" classNameContainer={styles.vipImage}/>
            <span>Parabéns você é um novo apoiador.</span>
          </div>
        )}

        <h1>Seja um apoiados deste projeto 🏆</h1>
        <h3>Contribua com apenas <span>R$ 1,00</span></h3>
        <strong>Apareça na nossa home, tenha funcionalidades exclusivas.</strong>

        <PayPalButtons 
          createOrder={ (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '1'
                }
              }]
            })
          }}
          onApprove={ (data, actions) => {
            return actions.order.capture().then((details) => {
              console.log('compra aprovada :' + details.payer.name.given_name, details);
              handleSaveDonate();
            })
          } }
        />

      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

  const session = await getSession({ req });

  if(!session?.id) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }

  const user = {
    name: session?.user.name,
    id: session.id,
    image: session?.user.image,
  };

  console.log('donate data', user);

  // Cria um novo indice "user"
  return {
    props: {
      user
    }
  };

}
