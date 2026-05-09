import styles from './Schedule.module.scss';
import ScheduleCard from '../../../components/ScheduleCard/ScheduleCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateScheduleRecModal from '../../../components/CreateScheduleRecModal/CreateScheduleRecModal';
import EditScheduleRecModal from '../../../components/EditScheduleRecModal/EditScheduleRecModal';
import GenerateLessonsModal from '../../../components/GenerateLessonsModal/GenerateLessonsModal';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { CalendarDays, Plus, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../../../utils/helper';
import api from '../../../api/axios';
import Loader from '../../../components/Loader/Loader';
import toast from 'react-hot-toast';
import { formatDateToISO } from '../../../utils/helper';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Schedule = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [createSchedule, setCreateSchedule] = useState(false);
    const [editSchedule, setEditSchedule] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [generateLessons, setGenerateLessons] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const { user } = useAuth();
    const [editModal, setEditModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/schedule');
                setSchedule(res.data.data);
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [editSchedule, createSchedule, generateLessons]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/clubs');
                setClubs(res.data.data);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();
    }, [createSchedule, editSchedule]);

    const handleCreate = async (scheduleData) => {
        setCreatingItem(true);
        try {
            const data = {
                clubId: scheduleData.clubId,
                dayOfWeek: scheduleData.dayOfWeek,
                startTime: scheduleData.startTime,
                endTime: scheduleData.endTime,
                room: scheduleData.room
            };

            await api.post('/schedule', { ...data });
            toast.success('Запись расписания добавлена');
            setCreateSchedule(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания записи расписания');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (scheduleData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/schedule/${scheduleData.id}`, {
                clubId: scheduleData.clubId,
                dayOfWeek: scheduleData.dayOfWeek,
                startTime: scheduleData.startTime,
                endTime: scheduleData.endTime,
                room: scheduleData.room
            });

            toast.success('Запись расписания обновлена');
            setEditSchedule(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления записи расписания');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleGenerateLessons = async (dateData) => {
        setCreatingItem(true);
        try {
            const data = {
                startDate: formatDateToISO(dateData.startDate),
                endDate: formatDateToISO(dateData.endDate),
            };

            await api.post('/schedule/lessons/generate', { ...data });
            toast.success('Уроки сгенерированы');
            setGenerateLessons(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка генерации уроков');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/schedule/${scheduleId}`);
            toast.success('Запись расписания удалена');
            setEditSchedule(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления записи расписания');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUserUpdate = async (formData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${user.id}`, formData);
            toast.success('Данные обновлены');
            setEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка обновления данных");
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    if (loading) return <Loader />;

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

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(false)}
                onEdit={() => {
                    setEditModal(true);
                    setIsSidebarOpen(false);
                }}
            />
            <EditScheduleRecModal
                record={selectedSchedule}
                clubs={clubs}
                isOpen={editSchedule}
                onClose={() => {
                    setEditSchedule(false);
                    setSelectedSchedule(false);
                }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                loading={submittingEdit}
            />
            <CreateScheduleRecModal
                clubs={clubs}
                isOpen={createSchedule}
                onClose={() => setCreateSchedule(false)}
                onAdd={handleCreate}
                loading={creatingItem}
            />
            <GenerateLessonsModal
                isOpen={generateLessons}
                onClose={() => setGenerateLessons(false)}
                onAdd={handleGenerateLessons}
                loading={creatingItem}
            />
            <EditProfile
                user={user}
                onSubmit={handleUserUpdate}
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                loading={submittingEdit}
            />
        </>
    );
}

export default Schedule;