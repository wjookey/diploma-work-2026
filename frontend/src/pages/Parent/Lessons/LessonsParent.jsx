import styles from './LessonsParent.module.scss';
import LessonCard from '../../../components/LessonCard/LessonCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { AlarmClock, Plus, Menu } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { formatDate, formatDateToISO } from '../../../utils/helper';
import Select from '../../../components/Select/Select';
import Input from '../../../components/Input/Input';
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";

const LessonsParent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = '/lessons?';
                if (startDate) url += `dateFrom=${formatDateToISO(startDate)}&`;
                if (endDate) url += `dateTo=${formatDateToISO(endDate)}&`;
                const res = await api.get(url);
                setLessons(res.data.data);
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [startDate, endDate]);

    if (loading) return <Loader />;

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
                    <div className={styles.input}>
                        <Input
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            type="date"
                        />
                    </div>
                    <div className={styles.input}>
                        <Input
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            type="date"
                        />
                    </div>
                </div>
                {lessonItems.length > 0 ? (
                    <div className={styles.lessonsBlock}>
                        {lessonItems}
                    </div>
                ) : (
                    <EmptyState
                        icon={AlarmClock}
                        title={'Нет уроков на этот период времени'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default LessonsParent;