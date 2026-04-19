import styles from './RecentPayments.module.scss';
import Card from '../Card/Card';
import { CalendarDays, CreditCard } from 'lucide-react';
import { formatDate } from '../../utils/helper';

const RecentPayments = ({payments}) => {
    const paymentItems = payments.map((payment) => (
        <li key={payment.id}>
            <div className={styles.info}>
                <div className={styles.text}><h3 className={styles.name}>{payment?.subscription?.child?.lastName} {payment?.subscription?.child?.firstName}</h3>
                <h3 className={styles.service}>{payment?.subscription?.clubService?.club?.name} - {payment?.subscription?.clubService?.name}</h3></div>
                <div className={styles.payment}>
                    <div className={styles.date}>
                        <p>{formatDate(payment?.paymentDate)}</p>
                        <CalendarDays className={styles.icon} />
                    </div>
                    <div className={styles.amount}>
                        <p>{payment?.amount} руб</p>
                        <CreditCard className={styles.icon} />
                    </div>
                </div>
            </div>
        </li>
    ));

    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.title}>
                    <CreditCard className={styles.icon} />
                    <p className={styles.text}>Последние оплаты</p>
                </div>
                {paymentItems.length > 0 ? (<ul className={styles.list}>
                    {paymentItems}
                </ul>
                ) : (
                    <p className={styles.subtext}>Нет оплат</p>
                )}
            </div>
        </Card>
    );
}

export default RecentPayments;