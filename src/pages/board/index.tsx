import { useState, FormEvent } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import styles from './styles.module.scss';
import { FiPlus, FiCalendar, FiEdit2, FiTrash, FiClock, FiX } from 'react-icons/fi';
import { SupportButton } from '../../components/SupportButton';
import firebase from '../../services/firebaseConnection';
import { format, formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

type TaskList = {
  id: string,
  created: string | Date,
  createdFormated?: string, // Interrogação alerta que não é obrigatório,
  task: string,
  userId: string,
  author: string
};

// Tipagem TS
interface BoardProps{
  user: {
    id: string;
    name: string;
    vip: boolean;
    lastDonate: string | Date
  }
  data: string
}

export default function Board({user, data}: BoardProps) {
  
  const [input, setInput] = useState('');
  const [tasks, setTask] = useState<TaskList[]>(JSON.parse(data));
  const [taskEdit, setTaskEdit] = useState<TaskList | null>(null);

  async function handleAddTask(e: FormEvent) {

    e.preventDefault();

    if(input === '') {
      alert('Escreva uma tarefa');
      return;
    }

    if(taskEdit) {
      
      await firebase.firestore().collection('tasks')
      .doc(taskEdit.id)
      .update({
        task: input
      })
      .then((doc) => {

        let data = tasks;
        let taskIndex = data.findIndex(item => item.id === taskEdit.id);

        data[taskIndex].task = input;

        setTask(data);
        setTaskEdit(null);
        setInput('');
        

      })
      .catch((err) => {
        console.log('Erro ao cadastrar: ', err);
      });

      return;

    }

    await firebase.firestore().collection('tasks')
      .add({
        created: new Date(),
        task: input,
        userId: user.id,
        author: user.name
      }) // Add unic id
      .then((doc) => {

        console.log('cadastrado com sucesso!', doc);
        
        let data = {
          id: doc.id,
          created: new Date(),
          createdFormated: format(new Date(), 'dd MMMM yyyy'),
          task: input,
          userId: user.id,
          author: user.name
        };

        console.log('then dooccccc data ', data);

        setTask([...tasks, data]);

        setInput('');

      })
      .catch((err) => {
        console.log('Erro ao cadastrar: ', err);
      });

  }

  function handleEdit(task: TaskList) {

    console.log('task', task);

    setTaskEdit(task);
    setInput(task.task);

  }

  async function handleDelete(id: string) {

    await firebase.firestore().collection('tasks').doc(id)
    .delete()
    .then((res) => {

      setTask(tasks.filter((item) => {
        return item.id !== id;
      }));

    }).catch((err) => {

    });

  }

  async function handleCancelEdit() {
    setInput('');
    setTaskEdit(null);
  }

  return(
    <>
      <Head>
        <title>Minhas tarefas - Board</title>
      </Head>
      <main className={styles.container}>

        {
          taskEdit && (
            <span className={styles.warnText}>
              <button onClick={ handleCancelEdit }>
                <FiX size="30" color="#ff3636"/>
              </button>
              Você está editando uma tarefa!
            </span>
          )
        }

        <form onSubmit={handleAddTask}> 
          <input 
            type="text" 
            placeholder="Digite sua tarefa..."
            value={input}
            onChange={(e) => { setInput(e.target.value) }}
          />
          <button type="submit">
            <FiPlus size={25} color="#17181f" />
          </button>
        </form>

      <h1>Você tem {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}!</h1>

      <section>

        {tasks.map(task => (

          <article className={styles.taskList} key={task.id}>
            <Link href={`/board/${task.id}`}>
              <a>
                <p>{task.task}</p>
              </a>
            </Link>
            <div className={styles.actions}>
              <div>
                <div>
                  <FiCalendar size={20} color="#FFB800"/>
                  <time>{task.createdFormated}</time>
                </div>

                {user.vip && (
                  <button onClick={ () => { handleEdit(task) } }>
                    <FiEdit2 size={20} color="#FFF" />
                    <span>Editar</span>
                  </button>
                )}

              </div>

              <button onClick={ () => { handleDelete(task.id) } }>
                <FiTrash size={20} color="#FF3636" />
                <span>Excluir</span>
              </button>
            </div>
          </article>

        ))}
      </section>

      </main>

      {user.vip && (
        <div className={styles.vipContainer}>
          <h3>Obrigado por apoiar esse projeto.</h3>
          <div>
            <FiClock size={28} color="#FFF" />
            <time>
              Última doação foi à { formatDistance(new Date(user.lastDonate), new Date(), { locale: ptBR }) }
            </time>
          </div>
        </div>
      )}
      

      <SupportButton/>

    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

  const session = await getSession({req});

  //session?. Ponto de interrogação é igual a função _.get do lodash, retorna undefined se não encontrado
  if(!session?.id) {

    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }

  }

  const dataTasks = await firebase.firestore().collection('tasks')
  .where('userId', '==', session.id)
  .orderBy('created', 'asc').get();

  // Precisa-se formatar os dados aqui porque o html é criado e deixado por 1 hora no servidor
  // Então se tiver algum tipo de formatação igual data, formata aqui e passa os dados para o servidor
  const data = JSON.stringify(dataTasks.docs.map(u => {
    return {
      id: u.id,
      createdFormated: format(u.data().created.toDate(), 'dd MMMM yyyy'),
      ...u.data()
    };
  }))

  const user = {
    name: session?.user.name,
    id: session?.id,
    vip: session?.vip,
    lastDonate: session?.lastDonate
  }

  console.log('session', session, data);

  return {
    props: {
      user,
      data
    }
  };

}