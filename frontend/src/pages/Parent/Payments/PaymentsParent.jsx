import styles from './PaymentsParent.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Menu, CreditCard, Plus } from 'lucide-react';
import PaymentCard from '../../../components/PaymentCard/PaymentCard';
import EditPaymentModal from '../../../components/EditPaymentModal/EditPaymentModal';
import CreatePaymentModal from '../../../components/CreatePaymentModal/CreatePaymentModal';
import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader/Loader';
import { formatDateToISO } from '../../../utils/helper';

const PaymentsParent = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createRequest, setCreateRequest] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = '/payments?';
                if (startDate) url += `dateFrom=${formatDateToISO(startDate)}&`;
                if (endDate) url += `dateTo=${formatDateToISO(endDate)}&`;
                const res = await api.get(url);
                setPayments(res.data.data);
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [startDate, endDate]);

    if (loading) return <Loader />;
    
    const paymentItems = payments.map((payment) => (
        <li key={payment.id}>
            <PaymentCard
                payment={payment}
                isEditMode={false}
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
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date"/>
                    <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date"/>
                </div>
                {paymentItems.length > 0 ? (
                    <div className={styles.payments}>
                        <ul className={styles.list}>{paymentItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={CreditCard}
                        title={'Нет оплат'}
                        description={'Добавьте первую оплату'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default PaymentsParent;
