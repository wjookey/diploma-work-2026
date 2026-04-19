import styles from './LessonsParent.module.scss';
import LessonCard from '../../../components/LessonCard/LessonCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { AlarmClock, Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../../../utils/helper';
import Select from '../../../components/Select/Select';
import Input from '../../../components/Input/Input';

const LessonsParent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lessons, setLessons] = useState([
      {
        id: 1,
        clubId: 1,
        date: "2026-04-05T00:00:00.000Z",
        startTime: "17:00",
        endTime: "18:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.190Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 4,
        clubId: 2,
        date: "2026-04-07T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 7,
        clubId: 3,
        date: "2026-04-07T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 3,
          name: "Калейдоскоп эмоций",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 10,
        clubId: 4,
        date: "2026-04-08T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.193Z",
        club: {
          id: 4,
          name: "Кактус",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 16,
        clubId: 6,
        date: "2026-04-09T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 2,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 6,
          name: "Фотокружок",
        },
        teacher: {
          id: 2,
          userId: 3,
          specialty: "Фотография",
          bio: null,
          user: {
            firstName: "Дмитрий",
            lastName: "Петров",
          },
        },
        attendances: [],
      },
      {
        id: 13,
        clubId: 5,
        date: "2026-04-09T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 4,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 5,
          name: "Театр Взлёт",
        },
        teacher: {
          id: 4,
          userId: 5,
          specialty: "Актерское мастерство",
          bio: null,
          user: {
            firstName: "Анастасия",
            lastName: "Данилова",
          },
        },
        attendances: [],
      },
      {
        id: 2,
        clubId: 1,
        date: "2026-04-12T00:00:00.000Z",
        startTime: "17:00",
        endTime: "18:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.190Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 8,
        clubId: 3,
        date: "2026-04-14T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 3,
          name: "Калейдоскоп эмоций",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 5,
        clubId: 2,
        date: "2026-04-14T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 11,
        clubId: 4,
        date: "2026-04-15T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.193Z",
        club: {
          id: 4,
          name: "Кактус",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 17,
        clubId: 6,
        date: "2026-04-16T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 2,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 6,
          name: "Фотокружок",
        },
        teacher: {
          id: 2,
          userId: 3,
          specialty: "Фотография",
          bio: null,
          user: {
            firstName: "Дмитрий",
            lastName: "Петров",
          },
        },
        attendances: [],
      },
      {
        id: 14,
        clubId: 5,
        date: "2026-04-16T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 4,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 5,
          name: "Театр Взлёт",
        },
        teacher: {
          id: 4,
          userId: 5,
          specialty: "Актерское мастерство",
          bio: null,
          user: {
            firstName: "Анастасия",
            lastName: "Данилова",
          },
        },
        attendances: [],
      },
      {
        id: 3,
        clubId: 1,
        date: "2026-04-19T00:00:00.000Z",
        startTime: "17:00",
        endTime: "18:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.190Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 6,
        clubId: 2,
        date: "2026-04-21T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 1,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 2,
          name: "Музыкальные истории",
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
          },
        },
        attendances: [],
      },
      {
        id: 9,
        clubId: 3,
        date: "2026-04-21T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.192Z",
        club: {
          id: 3,
          name: "Калейдоскоп эмоций",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 12,
        clubId: 4,
        date: "2026-04-22T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 3,
        createdAt: "2026-04-08T20:09:21.193Z",
        club: {
          id: 4,
          name: "Кактус",
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
          },
        },
        attendances: [],
      },
      {
        id: 15,
        clubId: 5,
        date: "2026-04-23T00:00:00.000Z",
        startTime: "16:00",
        endTime: "17:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 4,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 5,
          name: "Театр Взлёт",
        },
        teacher: {
          id: 4,
          userId: 5,
          specialty: "Актерское мастерство",
          bio: null,
          user: {
            firstName: "Анастасия",
            lastName: "Данилова",
          },
        },
        attendances: [],
      },
      {
        id: 18,
        clubId: 6,
        date: "2026-04-23T00:00:00.000Z",
        startTime: "18:00",
        endTime: "19:30",
        room: null,
        topic: null,
        status: "SCHEDULED",
        assignedTeacherId: 2,
        createdAt: "2026-04-08T20:09:21.194Z",
        club: {
          id: 6,
          name: "Фотокружок",
        },
        teacher: {
          id: 2,
          userId: 3,
          specialty: "Фотография",
          bio: null,
          user: {
            firstName: "Дмитрий",
            lastName: "Петров",
          },
        },
        attendances: [],
      },
    ]);
    const [clubs, setClubs] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const groupedLessons = {};
    const dates = [];
    lessons.forEach((l) => {
        if (!groupedLessons[l.date]) {
            groupedLessons[l.date] = [];
            dates.push(l.date)
        }
        groupedLessons[l.date].push(l);
    });
    console.log(groupedLessons);

    const lessonItems = dates.filter((d) => groupedLessons[d].length > 0).map((day) => (
        <div key={day} className={styles.day}>
            <h3 className={styles.date}>{formatDate(day)}</h3>
            <ul className={styles.lessons}>
                {groupedLessons[day].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((l) => (
                  <li key={l.id} className={styles.card}>
                        <LessonCard
                            lesson={l}
                            isEditMode={false}
                            isMarkAttMode={false}
                        />
                  </li>
                ))}
            </ul>
        </div>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Уроки</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
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
                    <div className={styles.input}><Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date"/></div>
                    <div className={styles.input}><Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date"/></div>
                </div>
                {lessonItems.length > 0 ? (
                    <div className={styles.lessonsBlock}>
                        {lessonItems}
                    </div>
                ) : (
                    <EmptyState
                        icon={AlarmClock}
                        title={'Нет записей расписания'}
                        description={'Создайте первую запись'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default LessonsParent;