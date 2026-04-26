import styles from './ScheduleTeacher.module.scss';
import ScheduleCard from '../../../components/ScheduleCard/ScheduleCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateScheduleRecModal from '../../../components/CreateScheduleRecModal/CreateScheduleRecModal';
import EditScheduleRecModal from '../../../components/EditScheduleRecModal/EditScheduleRecModal';
import GenerateLessonsModal from '../../../components/GenerateLessonsModal/GenerateLessonsModal';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { CalendarDays, Plus, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DAYS_OF_WEEK } from '../../../utils/helper';
import toast from 'react-hot-toast';
import api from '../../../api/axios';

const Schedule = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/schedule');
                setSchedule(res.data.data);
            } catch (error) {
                toast.error('Ошибка получения данных');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

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
                        isEditMode={false}
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
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default Schedule;