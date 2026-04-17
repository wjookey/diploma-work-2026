import styles from './Payments.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Menu, CreditCard, Plus } from 'lucide-react';
import PaymentCard from '../../../components/PaymentCard/PaymentCard';
import EditPaymentModal from '../../../components/EditPaymentModal/EditPaymentModal';
import CreatePaymentModal from '../../../components/CreatePaymentModal/CreatePaymentModal';
import { useState } from 'react';

const Payments = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [createPayment, setCreatePayment] = useState(false);
    const [editPayment, setEditPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [payments, setPayments] = useState([
      {
        id: 1,
        subscriptionId: 1,
        amount: 8400,
        paymentDate: "2026-04-03T00:00:00.000Z",
        paymentMethod: "Наличные",
        note: null,
        createdAt: "2026-04-08T20:09:21.200Z",
        subscription: {
          id: 1,
          childId: 1,
          clubId: 4,
          clubServiceId: 14,
          remainingLessons: 12,
          usedFreezes: 0,
          stateUpdateDate: null,
          startDate: "2026-04-06T00:00:00.000Z",
          endDate: null,
          status: "ACTIVE",
          createdAt: "2026-04-08T20:09:21.195Z",
          updatedAt: "2026-04-08T20:09:21.195Z",
          child: {
            id: 1,
            firstName: "Артём",
            lastName: "Давыдов",
            birthDate: "2016-03-15T00:00:00.000Z",
            familyId: 1,
            note: null,
            createdAt: "2026-04-08T20:09:21.153Z",
            family: {
              id: 1,
              familyName: "Семья Давыдовых",
              createdAt: "2026-04-08T20:09:21.153Z",
              parents: [
                {
                  id: 1,
                  userId: 6,
                  familyId: 1,
                  user: {
                    firstName: "Дмитрий",
                    lastName: "Давыдова",
                  },
                },
                {
                  id: 2,
                  userId: 7,
                  familyId: 1,
                  user: {
                    firstName: "Александра",
                    lastName: "Давыдова",
                  },
                },
              ],
            },
          },
          clubService: {
            id: 14,
            name: "Абонемент на 12 занятий (+2 заморозки)",
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: 4,
            type: "SUBSCRIPTION",
            isActive: true,
            createdAt: "2026-04-08T20:09:21.183Z",
            club: {
              id: 4,
              name: "Кактус",
            },
          },
        },
      },
      {
        id: 2,
        subscriptionId: 3,
        amount: 8400,
        paymentDate: "2026-04-03T00:00:00.000Z",
        paymentMethod: "Карта",
        note: null,
        createdAt: "2026-04-08T20:09:21.200Z",
        subscription: {
          id: 3,
          childId: 2,
          clubId: 1,
          clubServiceId: 2,
          remainingLessons: 12,
          usedFreezes: 0,
          stateUpdateDate: null,
          startDate: "2026-04-05T00:00:00.000Z",
          endDate: null,
          status: "ACTIVE",
          createdAt: "2026-04-08T20:09:21.197Z",
          updatedAt: "2026-04-08T20:09:21.197Z",
          child: {
            id: 2,
            firstName: "Алиса",
            lastName: "Давыдова",
            birthDate: "2018-07-22T00:00:00.000Z",
            familyId: 1,
            note: null,
            createdAt: "2026-04-08T20:09:21.153Z",
            family: {
              id: 1,
              familyName: "Семья Давыдовых",
              createdAt: "2026-04-08T20:09:21.153Z",
              parents: [
                {
                  id: 1,
                  userId: 6,
                  familyId: 1,
                  user: {
                    firstName: "Дмитрий",
                    lastName: "Давыдова",
                  },
                },
                {
                  id: 2,
                  userId: 7,
                  familyId: 1,
                  user: {
                    firstName: "Александра",
                    lastName: "Давыдова",
                  },
                },
              ],
            },
          },
          clubService: {
            id: 2,
            name: "Абонемент на 12 занятий (+2 заморозки)",
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: 1,
            type: "SUBSCRIPTION",
            isActive: true,
            createdAt: "2026-04-08T20:09:21.171Z",
            club: {
              id: 1,
              name: "Музыкальная энциклопедия",
            },
          },
        },
      },
      {
        id: 3,
        subscriptionId: 4,
        amount: 5400,
        paymentDate: "2026-04-03T00:00:00.000Z",
        paymentMethod: "Карта",
        note: null,
        createdAt: "2026-04-08T20:09:21.200Z",
        subscription: {
          id: 4,
          childId: 2,
          clubId: 5,
          clubServiceId: 19,
          remainingLessons: 6,
          usedFreezes: 0,
          stateUpdateDate: null,
          startDate: "2026-04-06T00:00:00.000Z",
          endDate: null,
          status: "ACTIVE",
          createdAt: "2026-04-08T20:09:21.198Z",
          updatedAt: "2026-04-08T20:09:21.198Z",
          child: {
            id: 2,
            firstName: "Алиса",
            lastName: "Давыдова",
            birthDate: "2018-07-22T00:00:00.000Z",
            familyId: 1,
            note: null,
            createdAt: "2026-04-08T20:09:21.153Z",
            family: {
              id: 1,
              familyName: "Семья Давыдовых",
              createdAt: "2026-04-08T20:09:21.153Z",
              parents: [
                {
                  id: 1,
                  userId: 6,
                  familyId: 1,
                  user: {
                    firstName: "Дмитрий",
                    lastName: "Давыдова",
                  },
                },
                {
                  id: 2,
                  userId: 7,
                  familyId: 1,
                  user: {
                    firstName: "Александра",
                    lastName: "Давыдова",
                  },
                },
              ],
            },
          },
          clubService: {
            id: 19,
            name: "Абонемент на 6 занятий",
            price: 5400,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: 5,
            type: "SUBSCRIPTION",
            isActive: true,
            createdAt: "2026-04-08T20:09:21.186Z",
            club: {
              id: 5,
              name: "Театр Взлёт",
            },
          },
        },
      },
    ]);
    const [subscriptions, setSubscriptions] = useState([]);
    
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
                    <div className={styles.payments}>
                        <ul className={styles.list}>{paymentItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={CreditCard}
                        title={'Нет оплат'}
                        description={'Добавьте первую оплату'}
                        action={<Button icon={Plus} onClick={() => setCreatePayment(true)}>Записать оплату</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreatePaymentModal subscriptions={subscriptions} isOpen={createPayment} onClose={() => setCreatePayment(false)} />
            <EditPaymentModal
                payment={selectedPayment}
                subscriptions={subscriptions}
                isOpen={editPayment} 
                onClose={() => {
                    setEditPayment(false);
                    setSelectedPayment(null);
                }}
            />
        </>
    );
}

export default Payments;
