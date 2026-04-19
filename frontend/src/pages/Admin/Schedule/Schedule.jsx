import styles from './Schedule.module.scss';
import ScheduleCard from '../../../components/ScheduleCard/ScheduleCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateScheduleRecModal from '../../../components/CreateScheduleRecModal/CreateScheduleRecModal';
import EditScheduleRecModal from '../../../components/EditScheduleRecModal/EditScheduleRecModal';
import GenerateLessonsModal from '../../../components/GenerateLessonsModal/GenerateLessonsModal';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { CalendarDays, Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import { DAYS_OF_WEEK } from '../../../utils/helper';

const Schedule = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [schedule, setSchedule] = useState([
      {
        id: 1,
        clubId: 4,
        dayOfWeek: 1,
        startTime: "15:00",
        endTime: "15:30",
        room: null,
        club: {
          id: 4,
          name: "Кактус",
          description: null,
          classCategoryId: 2,
          defaultTeacherId: 3,
          maxStudents: null,
          isActive: true,
          createdAt: "2026-04-08T20:09:21.164Z",
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
          },
        },
      },
      {
        id: 2,
        clubId: 4,
        dayOfWeek: 1,
        startTime: "16:30",
        endTime: "17:30",
        room: null,
        club: {
          id: 4,
          name: "Кактус",
          description: null,
          classCategoryId: 2,
          defaultTeacherId: 3,
          maxStudents: null,
          isActive: true,
          createdAt: "2026-04-08T20:09:21.164Z",
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
          },
        },
      },
      {
        id: 3,
        clubId: 4,
        dayOfWeek: 1,
        startTime: "17:30",
        endTime: "18:30",
        room: null,
        club: {
          id: 4,
          name: "Кактус",
          description: null,
          classCategoryId: 2,
          defaultTeacherId: 3,
          maxStudents: null,
          isActive: true,
          createdAt: "2026-04-08T20:09:21.164Z",
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
          },
        },
      },
      {
        id: 5,
        clubId: 4,
        dayOfWeek: 2,
        startTime: "16:30",
        endTime: "17:30",
        room: null,
        club: {
          id: 4,
          name: "Кактус",
          description: null,
          classCategoryId: 2,
          defaultTeacherId: 3,
          maxStudents: null,
          isActive: true,
          createdAt: "2026-04-08T20:09:21.164Z",
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
          },
        },
      },
      {
        id: 4,
        clubId: 4,
        dayOfWeek: 2,
        startTime: "17:30",
        endTime: "18:30",
        room: null,
        club: {
          id: 4,
          name: "Кактус",
          description: null,
          classCategoryId: 2,
          defaultTeacherId: 3,
          maxStudents: null,
          isActive: true,
          createdAt: "2026-04-08T20:09:21.164Z",
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
          },
        },
      },
    ]);
    const [clubs, setClubs] = useState([]);
    const [createSchedule, setCreateSchedule] = useState(false);
    const [editSchedule, setEditSchedule] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [generateLessons, setGenerateLessons] = useState(false);

    const groupedSchedule = {};
    DAYS_OF_WEEK.forEach((d) => groupedSchedule[d.value] = []);
    schedule.forEach((s) => {
        if (groupedSchedule[s.dayOfWeek]) groupedSchedule[s.dayOfWeek].push(s);
    });

    const scheduleItems = DAYS_OF_WEEK.filter((d) => groupedSchedule[d.value].length > 0).map((day) => (
        <div key={day.value} className={styles.day}>
            <h3 className={styles.dayName}>{day.label}</h3>
            <ul className={styles.lessons}>
                {groupedSchedule[day.value].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((rec) => (
                    <li key={rec.id} className={styles.card}><ScheduleCard
                        record={rec}
                        onEdit={() => {
                            setSelectedSchedule(rec);
                            setEditSchedule(true);
                        }}
                    /></li>
                ))}
            </ul>
        </div>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Расписание</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setGenerateLessons(true)}>Сгенерировать уроки</Button>
                    <Button variant='primary' onClick={() => setCreateSchedule(true)}>Добавить в расписание</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                {scheduleItems.length > 0 ? (
                    <div className={styles.schedule}>
                        {scheduleItems}
                    </div>
                ) : (
                    <EmptyState
                        icon={CalendarDays}
                        title={'Нет записей расписания'}
                        description={'Создайте первую запись'}
                        action={<Button icon={Plus} onClick={() => setCreateSchedule(true)}>Добавить запись</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <EditScheduleRecModal
                record={selectedSchedule}
                clubs={clubs || []}
                isOpen={editSchedule}
                onClose={() => {
                    setEditSchedule(false);
                    setSelectedSchedule(false);
                }}
            />
            <CreateScheduleRecModal clubs={clubs} isOpen={createSchedule} onClose={() => setCreateSchedule(false)} />
            <GenerateLessonsModal isOpen={generateLessons} onClose={() => setGenerateLessons(false)} />
        </>
    );
}

export default Schedule;