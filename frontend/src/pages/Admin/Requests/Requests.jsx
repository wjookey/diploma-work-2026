import styles from "./Requests.module.scss";
import Sidebar from "../../../components/Sidebar/Sidebar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Button from "../../../components/Button/Button";
import { Menu, FileText, Plus } from "lucide-react";
import RequestCard from '../../../components/RequestCard/RequestCard';
import Select from "../../../components/Select/Select";
import { REQUEST_STATUS } from "../../../utils/helper";
import { useState } from "react";

const Requests = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [requests, setRequests] = useState([
      {
        id: 2,
        familyId: 3,
        childId: 5,
        clubServiceId: 21,
        message: null,
        status: "PENDING",
        createdAt: "2026-04-08T20:09:21.202Z",
        updatedAt: "2026-04-08T20:09:21.202Z",
        family: {
          id: 3,
          familyName: "Семья Смирновых",
          createdAt: "2026-04-08T20:09:21.159Z",
          parents: [
            {
              id: 4,
              userId: 9,
              familyId: 3,
              user: {
                firstName: "Максим",
                lastName: "Смирнов",
                phone: "89999999990",
                email: "smirnov@educrm.ru",
              },
            },
            {
              id: 5,
              userId: 10,
              familyId: 3,
              user: {
                firstName: "Ксения",
                lastName: "Смирнова",
                phone: "89999999991",
                email: "smirnova@educrm.ru",
              },
            },
          ],
        },
        child: {
          id: 5,
          firstName: "Мария",
          lastName: "Смирнова",
        },
        clubService: {
          id: 21,
          name: "Абонемент на 12 занятий (+2 заморозки)",
          price: 6000,
          subscriptionLessons: 12,
          freezedLesson: 2,
          clubId: 6,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.188Z",
          club: {
            id: 6,
            name: "Фотокружок",
          },
        },
      },
      {
        id: 1,
        familyId: 2,
        childId: 3,
        clubServiceId: 3,
        message: null,
        status: "PENDING",
        createdAt: "2026-04-08T20:09:21.201Z",
        updatedAt: "2026-04-08T20:09:21.201Z",
        family: {
          id: 2,
          familyName: "Семья Самсоновых",
          createdAt: "2026-04-08T20:09:21.157Z",
          parents: [
            {
              id: 3,
              userId: 8,
              familyId: 2,
              user: {
                firstName: "Анастасия",
                lastName: "Самсонова",
                phone: "89999999992",
                email: "samsonova@educrm.ru",
              },
            },
          ],
        },
        child: {
          id: 3,
          firstName: "Владислав",
          lastName: "Самсонов",
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
      },
    ]);
    const [children, setChildren] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const requestItems = requests.map((request) => (
        <li key={request.id}><RequestCard request={request} /></li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Заявки</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Select
                        value={selectedChild}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    />
                    <Select
                        value={selectedClub}
                        placeholder={selectedClub ? '' : "Кружок"}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        options={clubs.map((club) => (
                            {
                                value: club.id,
                                label: club.name
                            }
                        ))}
                    />
                    <Select
                        value={selectedStatus}
                        placeholder={selectedStatus ? '' : "Статус"}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={REQUEST_STATUS.map((s) => (
                            {
                                value: s.id,
                                label: s.label
                            }
                        ))}
                    />
                </div>
                {requestItems.length > 0 ? (
                    <div className={styles.requests}>
                        <ul className={styles.list}>{requestItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title={'Нет заявок'}
                        description={'Дождитесь получения заявки'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default Requests;
