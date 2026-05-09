import styles from './Teachers.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import TeacherCard from '../../../components/TeacherCard/TeacherCard';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Menu, Search, Plus, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateTeacherModal from '../../../components/CreateTeacherModal/CreateTeacherModal';
import EditTeacherModal from '../../../components/EditTeacherModal/EditTeacherModal';
import Loader from '../../../components/Loader/Loader';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Pagination from "../../../components/Pagination/Pagination";
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Teachers = () => {
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [createTeacherModal, setCreateTeacherModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingTeacher, setCreatingTeacher] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const { user } = useAuth();
    const [editUserModal, setEditUserModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const url = search
                    ? `/users?role=TEACHER&search=${encodeURIComponent(search)}&page=${pagination.page}&limit=${pagination.limit}`
                    : `/users?role=TEACHER&page=${pagination.page}&limit=${pagination.limit}`;
                const res = await api.get(url);
                setTeachers(res.data.data);
                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        limit: res.data.pagination.limit,
                        total: res.data.pagination.total,
                        totalPages: res.data.pagination.totalPages,
                    });
                }
            } catch (error) {
                toast.error("Ошибка загрузки данных преподавателей");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [search, createTeacherModal, editModal, pagination.page]);

    const handleCreateTeacher = async (teacherData) => {
        setCreatingTeacher(true);
        try {
            const user = {
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                email: teacherData.email,
                phone: teacherData.phone,
                password: 'password123',
            }

            await api.post('/users', { ...user, role: 'TEACHER' });
            toast.success("Преподаватель добавлен");
            setCreateTeacherModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления преподавателя');
            console.error(error);
        } finally {
            setCreatingTeacher(false);
        }
    };

    const handleUpdateTeacher = async (teacherData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${teacherData.id}`, {
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                phone: teacherData.phone,
                email: teacherData.email
            });

            toast.success('Данные преподавателя обновлены');
            setEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления преподавателя');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    }

    const handleDeleteTeacher = async (userId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/users/${userId}`);
            toast.success('Преподаватель удалён');
            setEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления преподавателя');
        } finally {
            setSubmittingEdit(false);
        }
    }

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleUserUpdate = async (formData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${user.id}`, formData);
            toast.success('Данные обновлены');
            setEditUserModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка обновления данных");
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    if (loading) return <Loader />;

    const teacherItems = teachers.map((teacher) => (
        <li key={teacher.id}>
            <TeacherCard
                teacher={teacher}
                onEdit={() => {
                    setSelectedTeacher(teacher);
                    setEditModal(true);
                }}
            />
        </li>
    ))

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Преподаватели</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreateTeacherModal(true)}>Добавить преподавателя</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Введите контактные данные семьи'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {teacherItems.length > 0 ? (
                    <div className={styles.teachers}>
                        <>
                            <ul className={styles.list}>{teacherItems}</ul>
                            <Pagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </>
                        
                    </div>
                ) : (
                    <EmptyState
                        icon={GraduationCap}
                        title={'Нет учителей'}
                        description={'Добавьте первого учителя для начала работы'}
                        action={<Button icon={Plus} onClick={() => setCreateTeacherModal(true)}>Добавить учителя</Button>}
                    />
                )}
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(false)}
                onEdit={() => {
                    setEditUserModal(true);
                    setIsSidebarOpen(false);
                }}
            />
            <CreateTeacherModal
                isOpen={createTeacherModal}
                onClose={() => setCreateTeacherModal(false)}
                onAdd={handleCreateTeacher}
                loading={creatingTeacher}
            />
            <EditTeacherModal
                user={selectedTeacher}
                isOpen={editModal} 
                onClose={() => {
                    setEditModal(false);
                    setSelectedTeacher(null);
                }}
                onSubmit={handleUpdateTeacher}
                onDelete={handleDeleteTeacher}
                loading={submittingEdit}
            />
            <EditProfile
                user={user}
                onSubmit={handleUserUpdate}
                isOpen={editUserModal}
                onClose={() => setEditUserModal(false)}
                loading={submittingEdit}
            />
        </>
    );
}

export default Teachers;