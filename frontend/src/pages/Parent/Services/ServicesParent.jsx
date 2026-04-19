import styles from './ServicesParent.module.scss';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import ClubServiceCard from '../../../components/ClubServiceCard/ClubServiceCard';
import { Search, Menu, Plus, Clipboard } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateRequestModal from '../../../components/CreateRequestModal/CreateRequestModal';

const ServicesParent = () => {
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [children, setChildren] = useState([]);
    const [createRequest, setCreateRequest] = useState(false);
    const [services, setServices] = useState([
      {
        id: 6,
        name: "Абонемент на 12 занятий (+2 заморозки)",
        price: 8400,
        subscriptionLessons: 12,
        freezedLesson: 2,
        clubId: 2,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.175Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
          isActive: true,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 2,
        name: "Абонемент на 12 занятий (+2 заморозки)",
        price: 8400,
        subscriptionLessons: 12,
        freezedLesson: 2,
        clubId: 1,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.171Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
          isActive: false,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 7,
        name: "Абонемент на 6 занятий",
        price: 4500,
        subscriptionLessons: 6,
        freezedLesson: 0,
        clubId: 2,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.177Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
          isActive: true,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 3,
        name: "Абонемент на 6 занятий",
        price: 4500,
        subscriptionLessons: 6,
        freezedLesson: 0,
        clubId: 1,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.172Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
          isActive: false,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 5,
        name: "Пробное занятие",
        price: 600,
        subscriptionLessons: 1,
        freezedLesson: 0,
        clubId: 2,
        type: "TRIAL",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.174Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
          isActive: true,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 1,
        name: "Пробное занятие",
        price: 600,
        subscriptionLessons: 1,
        freezedLesson: 0,
        clubId: 1,
        type: "TRIAL",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.167Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
          isActive: false,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
      {
        id: 4,
        name: "Разовое занятие",
        price: 800,
        subscriptionLessons: 1,
        freezedLesson: 0,
        clubId: 1,
        type: "SINGLE",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.173Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
          isActive: false,
          description: null,
          clubCategory: {
            id: 1,
            name: "Музыкальные занятия",
          },
          teacher: {
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
      },
    ]);
    const [clubs, setClubs] = useState([]);

    const serviceItems = services.map((service) => (
        <li key={service.id}>
            <ClubServiceCard
                clubService={service}
                isEditMode={false}
            />
        </li>
    ))

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Услуги</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreateRequest(true)}>Оставить заявку</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Поиск по названию'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {serviceItems.length > 0 ? (
                    <div className={styles.services}>
                        <ul className={styles.list}>{serviceItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={Clipboard}
                        title={'Нет услуг'}
                        description={'Добавьте первую услугу для начала работы'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreateRequestModal children={children} clubs={clubs} services={services} isOpen={createRequest} onClose={() => setCreateRequest(false)} />
        </>
    );
}

export default ServicesParent;