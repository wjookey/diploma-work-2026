import styles from './Lessons.module.scss';
import LessonCard from '../../../components/LessonCard/LessonCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateScheduleRecModal from '../../../components/CreateScheduleRecModal/CreateScheduleRecModal';
import EditLessonModal from '../../../components/EditLessonModal/EditLessonModal';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { AlarmClock, Plus, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateToISO } from '../../../utils/helper';
import Select from '../../../components/Select/Select';
import Input from '../../../components/Input/Input';
import CreateLessonModal from '../../../components/CreateLessonModal/CreateLessonModal';
import AttendanceModal from '../../../components/AttendanceModal/AttendanceModal';
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";
import Pagination from '../../../components/Pagination/Pagination';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Lessons = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [createLesson, setCreateLesson] = useState(false);
    const [editLesson, setEditLesson] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setHours(3, 0, 0, 0)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [selectedAttendance, setSelectedAttendance] = useState([]);
    const [attendanceModal, setAttendanceModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const { user } = useAuth();
    const [editModal, setEditModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = `/lessons?page=${pagination.page}&limit=${pagination.limit}&`;
                if (selectedClub) url += `clubId=${selectedClub}&`;
                if (startDate) url += `dateFrom=${formatDateToISO(startDate)}&`;
                if (endDate) url += `dateTo=${formatDateToISO(endDate)}&`;
                const resLessons = await api.get(url);

                setLessons(resLessons.data.data);
                if (resLessons.data.pagination) {
                    setPagination({
                        page: resLessons.data.pagination.page,
                        limit: resLessons.data.pagination.limit,
                        total: resLessons.data.pagination.total,
                        totalPages: resLessons.data.pagination.totalPages,
                    });
                }
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [editLesson, createLesson, selectedClub, startDate, endDate, attendanceModal, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resClubs, resTeachers] = await Promise.all([
                    api.get('/clubs'),
                    api.get('/users?role=TEACHER')
                ])
                setTeachers(resTeachers.data.data);
                setClubs(resClubs.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, [editLesson, createLesson]);

    const handleCreate = async (lessonData) => {
        setCreatingItem(true);
        try {
            const data = {
                clubId: lessonData.clubId,
                date: lessonData.date,
                startTime: lessonData.startTime,
                endTime: lessonData.endTime,
                assignedTeacherId: lessonData.assignedTeacherId,
                room: lessonData.room,
                topic: lessonData.topic
            };

            await api.post('/lessons', { ...data });
            toast.success('Урок добавлен');
            setCreateLesson(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания урока');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (lessonData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/lessons/${lessonData.id}`, {
                clubId: lessonData.clubId,
                date: formatDateToISO(lessonData.date),
                startTime: lessonData.startTime,
                endTime: lessonData.endTime,
                assignedTeacherId: lessonData.assignedTeacherId,
                room: lessonData.room,
                topic: lessonData.topic
            });

            toast.success('Урок обновлен');
            setEditLesson(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления урока');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateStatus = async (lessonId, status) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/lessons/${lessonId}/status`, { status });
            toast.success('Статус урока изменён')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления статуса урока');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async (lessonId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/lessons/${lessonId}`);
            toast.success('Урок удалён');
            setEditLesson(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления урока');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleMarkAttendance = async () => {
        setSubmittingEdit(true);
        try {
            const attData = selectedAttendance.map((record) => ({ childId: record.child?.id || record.childId, isPresent: record.isPresent }));
            await api.post(`/attendances`, { lessonId: selectedLesson.id, attendances: attData });
            toast.success('Посещаемость отмечена');
            setAttendanceModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка отметки посещаемости');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleFillAttendance = async (lesson) => {
        try {
            if (lesson.attendances.length === 0 && lesson.status === 'SCHEDULED') {
                const url = `/subscriptions?clubId=${lesson.clubId}&status=ACTIVE`;
                const res = await api.get(url);
                const attendance = [];
                res.data.data.map((sub) => {
                    attendance.push({ child: sub.child, isPresent: false })
                });
                setSelectedAttendance(attendance);
            } else {
                setSelectedAttendance(lesson.attendances);
            }
            setSelectedLesson(lesson);
            setAttendanceModal(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePresenceChange = (index) => {
        const newAtt = [...selectedAttendance];
        newAtt[index].isPresent = !selectedAttendance[index].isPresent;
        setSelectedAttendance(newAtt);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
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

    const groupedLessons = {};
    const dates = [];
    lessons.forEach((l) => {
        if (!groupedLessons[l.date]) {
            groupedLessons[l.date] = [];
            dates.push(l.date)
        }
        groupedLessons[l.date].push(l);
    });

    const lessonItems = dates.filter((d) => groupedLessons[d].length > 0).map((day) => (
        <div key={day} className={styles.day}>
            <h3 className={styles.date}>{formatDate(day)}</h3>
            <ul className={styles.lessons}>
                {groupedLessons[day].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((l) => (
                    <li key={l.id} className={styles.card}><LessonCard
                        lesson={l}
                        onEdit={() => {
                            setSelectedLesson(l);
                            setEditLesson(true);
                        }}
                        onMarkAttendance={() => handleFillAttendance(l)}
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
                    <h1 className={styles.pageName}>Уроки</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateLesson(true)}>Добавить в расписание</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.input}><Select
                        value={selectedClub || ''}
                        placeholder={"Кружок"}
                        onChange={(e) => {
                            setSelectedClub(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={clubs.map((club) => (
                            {
                                value: club.id,
                                label: club.name
                            }
                        ))}
                    /></div>
                    <div className={styles.input}>
                        <Input
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            type="date"
                        />
                    </div>
                    <div className={styles.input}>
                        <Input
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            type="date"
                        />
                    </div>
                </div>
                {lessonItems.length > 0 ? (
                    <>
                        <div className={styles.lessonsBlock}>
                            {lessonItems}
                        </div>
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <EmptyState
                        icon={AlarmClock}
                        title={'Нет записей расписания'}
                        description={'Создайте первую запись'}
                        action={<Button icon={Plus} onClick={() => setCreateLesson(true)}>Добавить запись</Button>}
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
            <EditLessonModal
                lesson={selectedLesson}
                clubs={clubs}
                teachers={teachers}
                isOpen={editLesson}
                onClose={() => {
                    setEditLesson(false);
                    setSelectedLesson(null);
                }}
                onSubmit={handleUpdate}
                onStatusChange={handleUpdateStatus}
                onDelete={handleDelete}
                loading={submittingEdit}
            />
            <CreateLessonModal
                clubs={clubs}
                teachers={teachers}
                isOpen={createLesson}
                onClose={() => setCreateLesson(false)}
                onAdd={handleCreate}
                loading={creatingItem}
            />
            <AttendanceModal
                lesson={selectedLesson}
                attendance={selectedAttendance}
                isOpen={attendanceModal}
                onClose={() => {
                    setAttendanceModal(false);
                    setSelectedAttendance(null);
                    setSelectedLesson(null);
                }}
                onStatusChange={handlePresenceChange}
                onMarkAttendance={handleMarkAttendance}
                loading={submittingEdit}
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

export default Lessons;