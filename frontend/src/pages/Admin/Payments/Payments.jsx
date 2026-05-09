import styles from './Payments.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Menu, CreditCard, Plus } from 'lucide-react';
import PaymentCard from '../../../components/PaymentCard/PaymentCard';
import EditPaymentModal from '../../../components/EditPaymentModal/EditPaymentModal';
import CreatePaymentModal from '../../../components/CreatePaymentModal/CreatePaymentModal';
import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";
import { formatDateToISO } from '../../../utils/helper';
import Pagination from '../../../components/Pagination/Pagination';
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Payments = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [createPayment, setCreatePayment] = useState(false);
    const [editPayment, setEditPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [payments, setPayments] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
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
                let url = `/payments?page=${pagination.page}&limit=${pagination.limit}&`;
                if (startDate) url += `dateFrom=${formatDateToISO(startDate)}&`;
                if (endDate) url += `dateTo=${formatDateToISO(endDate)}&`;
                const res = await api.get(url);
                setPayments(res.data.data);
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
    }, [startDate, endDate, createPayment, editPayment, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/subscriptions');
                setSubscriptions(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, [createPayment]);

    const handleCreate = async (paymentData) => {
        setCreatingItem(true);
        try {
            const data = {
                subscriptionId: paymentData.subscriptionId,
                amount: paymentData.amount,
                paymentMethod: paymentData.paymentMethod,
                paymentDate: paymentData.paymentDate ? formatDateToISO(paymentData.paymentDate) : null,
                note: paymentData.note || null,
            };

            await api.post('/payments', { ...data });
            toast.success('Оплата записана');
            setCreatePayment(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка записи оплаты');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (paymentData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/payments/${paymentData.id}`, {
                amount: paymentData.amount,
                paymentMethod: paymentData.paymentMethod,
                paymentDate: paymentData.paymentDate,
                note: paymentData.note,
            });

            toast.success('Данные об оплате обновлены');
            setEditPayment(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления данных оплаты');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async (paymentId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/payments/${paymentId}`);
            toast.success('Оплата удалена');
            setEditPayment(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления оплаты');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
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

    if (loading) return <Loader />;

    const paymentItems = payments.map((payment) => (
        <li key={payment.id}>
            <PaymentCard
                payment={payment}
                onEdit={() => {
                    setSelectedPayment(payment);
                    setEditPayment(true);
                }}
            />
        </li>
    ))

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Оплата</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreatePayment(true)}>Записать оплату</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date"/>
                    <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date"/>
                </div>
                {paymentItems.length > 0 ? (
                    <>
                        <div className={styles.payments}>
                            <ul className={styles.list}>{paymentItems}</ul>
                        </div>
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                    
                ) : (
                    <EmptyState
                        icon={CreditCard}
                        title={'Нет оплат'}
                        description={'Добавьте первую оплату'}
                        action={<Button icon={Plus} onClick={() => setCreatePayment(true)}>Записать оплату</Button>}
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
            <CreatePaymentModal
                subscriptions={subscriptions}
                isOpen={createPayment}
                onClose={() => setCreatePayment(false)}
                onAdd={handleCreate}
                loading={creatingItem}
            />
            <EditPaymentModal
                payment={selectedPayment}
                subscriptions={subscriptions}
                isOpen={editPayment} 
                onClose={() => {
                    setEditPayment(false);
                    setSelectedPayment(null);
                }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
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

export default Payments;
