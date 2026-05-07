import styles from './Services.module.scss';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import CreateServiceModal from '../../../components/CreateServiceModal/CreateServiceModal';
import EditServiceModal from '../../../components/EditServiceModal/EditServiceModal';
import ClubServiceCard from '../../../components/ClubServiceCard/ClubServiceCard';
import { Search, Menu, Plus, Clipboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Sidebar from '../../../components/Sidebar/Sidebar';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import Pagination from '../../../components/Pagination/Pagination';

const Services = () => {
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [createSerModal, setCreateSerModal] = useState(false);
    const [services, setServices] = useState([]);
    const [editServiceModal, setEditServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const url = search
                    ? `/clubServices?search=${encodeURIComponent(search)}&page=${pagination.page}&limit=${pagination.limit}`
                    : `/clubServices?page=${pagination.page}&limit=${pagination.limit}`;
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
    }, [search, createSerModal, editServiceModal, pagination.page]);

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
    }, [createSerModal, editServiceModal]);

    const handleCreate = async (serviceData) => {
        setCreatingItem(true);
        try {
            const data = {
                name: serviceData.name,
                clubId: serviceData.clubId,
                type: serviceData.type,
                price: serviceData.price,
                subscriptionLessons: serviceData.subscriptionLessons,
                freezedLesson: serviceData.freezedLesson,
            };

            await api.post('/clubServices', { ...data });
            toast.success("Услуга добавлена");
            setCreateSerModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления услуги');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (serviceData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubServices/${serviceData.id}`, {
                name: serviceData.name,
                clubId: serviceData.clubId,
                type: serviceData.type,
                price: serviceData.price,
                subscriptionLessons: serviceData.subscriptionLessons,
                freezedLesson: serviceData.freezedLesson,
            });

            toast.success("Детали услуги обновлены");
            setEditServiceModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления деталей услуги');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateStatus = async (serviceId, isActive) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubServices/${serviceId}/status`, { isActive: Boolean(isActive) });
            toast.success('Статус услуги изменён')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления статуса услуги');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async (serviceId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/clubServices/${serviceId}`);
            toast.success('Услуга удалена');
            setEditServiceModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления услуги');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    }

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading) return <Loader />;

    const serviceItems = services.map((service) => (
        <li key={service.id}>
            <ClubServiceCard
                clubService={service}
                onEdit={() => { 
                    setSelectedService(service);
                    setEditServiceModal(true);
                }}
            />
        </li>
    ))

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Услуги</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreateSerModal(true)}>Добавить услугу</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Поиск по названию'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {serviceItems.length > 0 ? (
                    <div className={styles.services}>
                        <>
                            <ul className={styles.list}>{serviceItems}</ul>
                            <Pagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </>
                    </div>
                ) : (
                    <EmptyState
                        icon={Clipboard}
                        title={'Нет услуг'}
                        description={'Добавьте первую услугу для начала работы'}
                        action={<Button icon={Plus} onClick={() => setCreateSerModal(true)}>Добавить услугу</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreateServiceModal
                clubs={clubs}
                isOpen={createSerModal}
                onClose={() => setCreateSerModal(false)}
                onAdd={handleCreate}
                loading={creatingItem}
            />
            <EditServiceModal
                service={selectedService}
                clubs={clubs}
                isOpen={editServiceModal}
                onClose={() => {
                    setEditServiceModal(false);
                    setSelectedService(null);
                }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                onStatusChange={handleUpdateStatus}
                loading={submittingEdit}
            />
        </>
    );
}

export default Services;