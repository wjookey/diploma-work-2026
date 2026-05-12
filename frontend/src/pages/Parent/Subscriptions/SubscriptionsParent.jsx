import styles from './SubscriptionsParent.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Button from '../../../components/Button/Button';
import Select from '../../../components/Select/Select';
import SubscriptionCard from '../../../components/SubscriptionCard/SubscriptionCard';
import { Menu, Plus, BookOpen } from 'lucide-react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import SubDetailed from '../../../components/SubDetailed/SubDetailed';
import { useState, useEffect } from 'react';
import { SUBSCRIPTION_STATUS } from '../../../utils/helper';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader/Loader';
import Pagination from '../../../components/Pagination/Pagination';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const SubscriptionsParent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [watchSub, setWatchSub] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loading, setLoading] = useState(true);
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
                let url = `/subscriptions?page=${pagination.page}&limit=${pagination.limit}&`;
                if (selectedChild) url += `childId=${selectedChild}&`;
                if (selectedStatus) url += `status=${selectedStatus}&`;
                const res = await api.get(url);
                setSubscriptions(res.data.data);
                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        limit: res.data.pagination.limit,
                        total: res.data.pagination.total,
                        totalPages: res.data.pagination.totalPages,
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
    }, [selectedChild, selectedStatus, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/children');
                setChildren(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, []);

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

    const subItems = subscriptions.map((sub) => (
        <li key={sub.id}>
            <SubscriptionCard
                subscription={sub}
                isEditMode={false}
                onWatchDetailed={() => {
                    setSelectedSub(sub);
                    setSelectedPayment(sub?.payment);
                    setSelectedService(sub?.clubService);
                    setWatchSub(true);
                }}
            />
        </li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Абонементы</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.input}><Select
                        value={selectedChild || ''}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => {
                            setSelectedChild(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedStatus || ''}
                        placeholder={selectedStatus ? '' : "Статус"}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={SUBSCRIPTION_STATUS.map((s) => (
                            {
                                value: s.value,
                                label: s.label
                            }
                        ))}
                    /></div>
                </div>
                {subItems.length > 0 ? (
                    <>
                        <div className={styles.subscriptions}>
                            <ul className={styles.list}>{subItems}</ul>
                        </div>
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title={'Нет абонементов'}
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
            <SubDetailed
                subscription={selectedSub}
                service={selectedService}
                payment={selectedPayment}
                isOpen={watchSub}
                onClose={() => {
                    setWatchSub(false);
                    setSelectedSub(false);
                    setSelectedService(false);
                    setSelectedPayment(false);
                }}
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

export default SubscriptionsParent;