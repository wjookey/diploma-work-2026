import styles from './ServicesParent.module.scss';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import ClubServiceCard from '../../../components/ClubServiceCard/ClubServiceCard';
import { Search, Menu, Plus, Clipboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Sidebar from '../../../components/Sidebar/Sidebar';
import CreateRequestModal from '../../../components/CreateRequestModal/CreateRequestModal';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import Loader from '../../../components/Loader/Loader';
import Pagination from '../../../components/Pagination/Pagination';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const ServicesParent = () => {
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [children, setChildren] = useState([]);
    const [createRequest, setCreateRequest] = useState(false);
    const [services, setServices] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const { user } = useAuth();
    const [editModal, setEditModal] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const url = search
                    ? `/clubServices?search=${encodeURIComponent(search)}&isActive=true&page=${pagination.page}&limit=${pagination.limit}`
                    : `/clubServices?isActive=true&page=${pagination.page}&limit=${pagination.limit}`;
                const res = await api.get(url);
                setServices(res.data.data);
                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        limit: res.data.pagination.limit,
                        total: res.data.pagination.total,
                        totalPages: res.data.pagination.totalPages,
                    });
                }
            } catch (error) {
                toast.error("Ошибка загрузки данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [search, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resChild, resClub] = await Promise.all([
                    api.get('/children'),
                    api.get('/clubs'),
                ]);

                setChildren(resChild.data.data);
                setClubs(resClub.data.data);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();
    }, []);

    const handleCreateRequest = async (requestData) => {
        setCreatingItem(true);
        try {
            const data = {
                childId: requestData.childId,
                clubId: requestData.clubId,
                clubServiceId: requestData.clubServiceId,
                note: requestData.note || null
            };

            await api.post('/subscriptionRequests', data);
            toast.success('Заявка создана');
            setCreateRequest(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания заявки');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
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

    const serviceItems = services.map((service) => (
        <li key={service.id}>
            <ClubServiceCard
                clubService={service}
                isEditMode={false}
            />
        </li>
    ));

    if (loading) return <Loader />;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Услуги</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreateRequest(true)}>Оставить заявку</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Поиск по названию'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {serviceItems.length > 0 ? (
                    <>
                        <div className={styles.services}>
                            <ul className={styles.list}>{serviceItems}</ul>
                        </div>
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <EmptyState
                        icon={Clipboard}
                        title={'Нет услуг'}
                        description={'Дождитесь появления услуг'}
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
            <CreateRequestModal
                children={children}
                clubs={clubs}
                services={services}
                isOpen={createRequest}
                onClose={() => setCreateRequest(false)}
                onAdd={handleCreateRequest}
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

export default ServicesParent;