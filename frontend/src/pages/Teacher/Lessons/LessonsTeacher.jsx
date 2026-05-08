import styles from './LessonsTeacher.module.scss';
import LessonCard from '../../../components/LessonCard/LessonCard';
import Button from '../../../components/Button/Button';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { AlarmClock, Plus, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '../../../utils/helper';
import Select from '../../../components/Select/Select';
import Input from '../../../components/Input/Input';
import AttendanceModal from '../../../components/AttendanceModal/AttendanceModal';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import Loader from '../../../components/Loader/Loader';
import Pagination from '../../../components/Pagination/Pagination';

const LessonsTeacher = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [selectedAttendance, setSelectedAttendance] = useState([]);
    const [attendanceModal, setAttendanceModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = `/lessons?page=${pagination.page}&limit=${pagination.limit}&`;
                if (startDate) url += `dateFrom=${startDate}&`;
                if (endDate) url += `dateTo=${endDate}&`;
                const res = await api.get(url);
                setLessons(res.data.data);
                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        limit: res.data.pagination.limit,
                        total: res.data.pagination.total,
                        totalPages: res.data.pagination.totalPages,
                    });
                }
            } catch (error) {
                toast.error('Ошибка получения данных');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [startDate, endDate, attendanceModal, pagination.page]);

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
                        isEditMode={false}
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
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.input}>
                        <Input value={startDate}
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
                        title={'Нет уроков'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
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
        </>
    );
}

export default LessonsTeacher;