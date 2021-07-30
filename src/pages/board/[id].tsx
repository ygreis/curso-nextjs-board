import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import firebase from '../../services/firebaseConnection';
import { format } from 'date-fns';
import styles from './task.module.scss';
import Head from 'next/head';
import { FiCalendar } from 'react-icons/fi';

type Task = {
  id: string,
  created: string | Date,
  createdFormated?: string, // Interrogação alerta que não é obrigatório,
  task: string,
  userId: string,
  author: string
}

interface TaskDetailsProps{
  data: string
}

export default function Task({data}: TaskDetailsProps) {

  const task = JSON.parse(data) as Task;

  return (
    <>
      <Head>
        <title>Detalhes da tarefa: {task.task}</title>
      </Head>
      <article className={styles.container}>
        <div className={styles.actions}>
          <div>
            <FiCalendar size="30" color="#fff"/>
            <span>Tarefa criada: </span>
            <time>{task.createdFormated}</time>
          </div>
        </div>
        <p>{task.task}</p>
      </article>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {

  const { id } = params;
  const session = await getSession({req});

  //session?. Ponto de interrogação é igual a função _.get do lodash, retorna undefined se não encontrado
  if(!session?.vip) {

    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }

  }

  const data = await firebase.firestore().collection('tasks').doc(String(id)).get()
    .then((snapshot) => {
      
      const data = {
        id: snapshot.id,
        created: snapshot.data().created,
        createdFormated: format(snapshot.data().created.toDate(), 'dd MMMM yyyy'),
        task: snapshot.data().task,
        userId: snapshot.data().userId,
        author: snapshot.data().author,
      };

      return JSON.stringify(data);

    }).catch((err) => {
      return {};
    });

  if(!Object.keys(data).length) {
    return {
      redirect: {
        destination: '/board',
        permanent: false
      }
    }
  }

  return {
    props:{
      data
    }
  }

};