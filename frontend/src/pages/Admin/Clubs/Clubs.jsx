import styles from './Clubs.module.scss';
import ClubCard from '../../../components/ClubCard/ClubCard';
import CreateClubModal from '../../../components/CreateClubModal/CreateClubModal';
import EditClubModal from '../../../components/EditClubModal/EditClubModal';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { Search, Plus, Menu, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import EmptyState from "../../../components/EmptyState/EmptyState";
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import Loader from '../../../components/Loader/Loader';
import Pagination from '../../../components/Pagination/Pagination';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Clubs = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [createClubModal, setCreateClubModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedClub, setSelectedClub] = useState(null);
    const [isEditClub, setIsEditClub] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const { user } = useAuth();
    const [editModal, setEditModal] = useState(false);
    
    const [clubPagination, setClubPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const urlClub = search 
                    ? `/clubs?search=${encodeURIComponent(search)}&page=${clubPagination.page}&limit=${clubPagination.limit}` 
                    : `/clubs?page=${clubPagination.page}&limit=${clubPagination.limit}`;
                
                const resClub = await api.get(urlClub);
                
                setClubs(resClub.data.data);
                if (resClub.data.pagination) {
                    setClubPagination({
                        page: resClub.data.pagination.page,
                        limit: resClub.data.pagination.limit,
                        total: resClub.data.pagination.total,
                        totalPages: resClub.data.pagination.totalPages
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
    }, [search, createClubModal, isEditClub, clubPagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resTeacher, resCategory] = await Promise.all([
                    api.get('/users?role=TEACHER'),
                    api.get('/clubCategories'),
                ]);
                setTeachers(resTeacher.data.data);
                setCategories(resCategory.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, [isEditClub, createClubModal]);

    const handleCreateClub = async (clubData) => {
        setCreatingItem(true);
        try {
            const data = {
                name: clubData.name,
                description: clubData.description,
                classCategoryId: clubData.classCategoryId,
                defaultTeacherId: clubData.defaultTeacherId,
                maxStudents: clubData.maxStudents,
                dayClasses: clubData.dayClasses,
            };

            await api.post('/clubs', { ...data });
            toast.success('Кружок добавлен');
            setCreateClubModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания кружка');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdateClub = async (clubData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubs/${clubData.id}`, {
                name: clubData.name,
                description: clubData.description,
                classCategoryId: clubData.classCategoryId,
                defaultTeacherId: clubData.defaultTeacherId,
                maxStudents: clubData.maxStudents,
                dayClasses: clubData.dayClasses,
            });

            toast.success('Кружок обновлен');
            setIsEditClub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления кружка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateClubStatus = async (clubId, isActive) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubs/${clubId}/status`, { isActive: Boolean(isActive) });
            toast.success('Статус кружка изменён')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления статуса кружка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteClub = async (clubId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/clubs/${clubId}`);
            toast.success('Кружок удалён');
            setIsEditClub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления кружка');
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

    const clubItems = clubs.map((club) => (
        <li key={club.id}>
            <ClubCard
                club={club}
                onEdit={() => {
                    setSelectedClub(club);
                    setIsEditClub(true);
                }}
            />
        </li>
    ));

    const handleClubPageChange = (newPage) => {
        setClubPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading) return <Loader />;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Кружки</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateClubModal(true)}>Добавить кружок</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input
                        icon={Search}
                        placeholder={'Поиск по названию'}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setClubPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div className={styles.clubs}>
                    {clubItems.length > 0 ? (
                        <>
                            <ul className={styles.list}>{clubItems}</ul>
                            <Pagination 
                                pagination={clubPagination} 
                                onPageChange={handleClubPageChange}
                            />
                        </>
                    ) : (
                        <EmptyState
                            icon={Palette}
                            title={'Нет кружков'}
                            description={'Добавьте первый кружок для начала работы'}
                            action={<Button icon={Plus} onClick={() => setCreateClubModal(true)}>Добавить кружок</Button>}
                        />
                    )}
                </div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(false)}
                onEdit={() => {
                    setEditModal(true);
                    setIsSidebarOpen(false);
                }}
            />
            <CreateClubModal
                isOpen={createClubModal}
                onClose={() => setCreateClubModal(false)}
                categories={categories}
                teachers={teachers}
                onAdd={handleCreateClub}
                loading={creatingItem}
            />
            <EditClubModal
                club={selectedClub}
                categories={categories}
                teachers={teachers}
                isOpen={isEditClub}
                onClose={() => {
                    setIsEditClub(false);
                    setSelectedClub(null);
                }}
                onSubmit={handleUpdateClub}
                onStatusChange={handleUpdateClubStatus}
                onDelete={handleDeleteClub}
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

export default Clubs;