import styles from './SubscriptionsParent.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Button from '../../../components/Button/Button';
import Select from '../../../components/Select/Select';
import SubscriptionCard from '../../../components/SubscriptionCard/SubscriptionCard';
import { Menu, Plus, BookOpen } from 'lucide-react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import SubDetailed from '../../../components/SubDetailed/SubDetailed';
import { useState } from 'react';
import { SUBSCRIPTION_STATUS } from '../../../utils/helper';

const SubscriptionsParent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([
      {
        id: 6,
        childId: 4,
        clubId: 5,
        clubServiceId: 18,
        remainingLessons: 12,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-14T21:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-14T14:57:33.642Z",
        updatedAt: "2026-04-14T14:57:33.642Z",
        child: {
          id: 4,
          firstName: "Анастасия",
          lastName: "Смирнова",
        },
        clubService: {
          id: 18,
          name: "Абонемент на 12 занятий (+2 заморозки)",
          price: 10800,
          subscriptionLessons: 12,
          freezedLesson: 2,
          clubId: 5,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.186Z",
          club: {
            id: 5,
            name: "Театр Взлёт",
          },
        },
        payment: null,
      },
      {
        id: 5,
        childId: 4,
        clubId: 1,
        clubServiceId: 3,
        remainingLessons: 6,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-05T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.199Z",
        updatedAt: "2026-04-08T20:09:21.199Z",
        child: {
          id: 4,
          firstName: "Анастасия",
          lastName: "Смирнова",
        },
        clubService: {
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
          },
        },
        payment: null,
      },
      {
        id: 4,
        childId: 2,
        clubId: 5,
        clubServiceId: 19,
        remainingLessons: 6,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-06T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.198Z",
        updatedAt: "2026-04-08T20:09:21.198Z",
        child: {
          id: 2,
          firstName: "Алиса",
          lastName: "Давыдова",
        },
        clubService: {
          id: 19,
          name: "Абонемент на 6 занятий",
          price: 5400,
          subscriptionLessons: 6,
          freezedLesson: 0,
          clubId: 5,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.186Z",
          club: {
            id: 5,
            name: "Театр Взлёт",
          },
        },
        payment: {
          id: 3,
          amount: 5400,
        },
      },
      {
        id: 3,
        childId: 2,
        clubId: 1,
        clubServiceId: 2,
        remainingLessons: 12,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-05T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.197Z",
        updatedAt: "2026-04-08T20:09:21.197Z",
        child: {
          id: 2,
          firstName: "Алиса",
          lastName: "Давыдова",
        },
        clubService: {
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
          },
        },
        payment: {
          id: 2,
          amount: 8400,
        },
      },
      {
        id: 2,
        childId: 1,
        clubId: 6,
        clubServiceId: 23,
        remainingLessons: 1,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-06T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.196Z",
        updatedAt: "2026-04-08T20:09:21.196Z",
        child: {
          id: 1,
          firstName: "Артём",
          lastName: "Давыдов",
        },
        clubService: {
          id: 23,
          name: "Разовое занятие",
          price: 800,
          subscriptionLessons: 1,
          freezedLesson: 0,
          clubId: 6,
          type: "SINGLE",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.190Z",
          club: {
            id: 6,
            name: "Фотокружок",
          },
        },
        payment: null,
      },
      {
        id: 1,
        childId: 1,
        clubId: 4,
        clubServiceId: 14,
        remainingLessons: 12,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-06T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.195Z",
        updatedAt: "2026-04-08T20:09:21.195Z",
        child: {
          id: 1,
          firstName: "Артём",
          lastName: "Давыдов",
        },
        clubService: {
          id: 14,
          name: "Абонемент на 12 занятий (+2 заморозки)",
          price: 8400,
          subscriptionLessons: 12,
          freezedLesson: 2,
          clubId: 4,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.183Z",
          club: {
            id: 4,
            name: "Кактус",
          },
        },
        payment: {
          id: 1,
          amount: 8400,
        },
      },
    ]);
    const [families, setFamilies] = useState([]);
    const [children, setChildren] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [watchSub, setWatchSub] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const subItems = subscriptions.map((sub) => (
        <li key={sub.id}>
            <SubscriptionCard
                subscription={sub}
                isEditMode={false}
                onWatchDetailed={() => {
                    setSelectedSub(sub);
                    setWatchSub(true);
                }}
            />
        </li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Абонементы</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.input}><Select
                        value={selectedFamily || ''}
                        placeholder={selectedFamily ? '' : "Семья"}
                        onChange={(e) => setSelectedFamily(e.target.value)}
                        options={families.map((fam) => (
                            {
                                value: fam.id,
                                label: fam.familyName
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedChild || ''}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedClub || ''}
                        placeholder={selectedClub ? '' : "Кружок"}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        options={clubs.map((club) => (
                            {
                                value: club.id,
                                label: club.name
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedStatus || ''}
                        placeholder={selectedStatus ? '' : "Статус"}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={SUBSCRIPTION_STATUS.map((s) => (
                            {
                                value: s.value,
                                label: s.label
                            }
                        ))}
                    /></div>
                </div>
                {subItems.length > 0 ? (
                    <div className={styles.subscriptions}>
                        <ul className={styles.list}>{subItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title={'Нет абонементов'}
                        description={'Создайте первый абонемент'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <SubDetailed
                subscription={selectedSub}
                service={selectedService}
                payment={selectedPayment}
                isOpen={watchSub}
                onClose={() => {
                    setWatchSub(false);
                    setSelectedSub(false);
                    setSelectedService(false);
                    setSelectedPayment(false);
                }}
            />
        </>
    );
}

export default SubscriptionsParent;