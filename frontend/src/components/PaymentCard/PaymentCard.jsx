import styles from './PaymentCard.module.scss';
import { Pen, CalendarDays, CreditCard, MessageSquare } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';
import { formatDate } from '../../utils/helper';

const PaymentCard = ({ payment, isEditMode = true, isInModal = false, onEdit }) => {
    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.info}>
                    <h3 className={styles.name}>{payment?.subscription?.child?.lastName} {payment?.subscription?.child?.firstName}</h3>
                    <div className={styles.payment}>
                        <h3 className={styles.service}>{payment?.subscription?.clubService?.club?.name} - {payment?.subscription?.clubService?.name}</h3>
                        <div className={styles.date}>
                            <CalendarDays className={styles.icon} />
                            <p>{formatDate(payment?.paymentDate)}</p>
                        </div>
                        <div className={styles.amount}>
                            <CreditCard className={styles.icon} />
                            <p>{payment?.amount} руб {payment?.paymentMethod !== undefined ? `- ${payment?.paymentMethod}` : ''}</p>
                        </div>
                        <div className={styles.note}>
                            <MessageSquare className={styles.icon} />
                            <p>{payment?.note !== null ? payment?.note : '-'}</p>
                        </div>
                    </div>
                </div>
                {isEditMode && (<div className={styles.buttons}>
                    <div className={styles.button}><Button variant='primary' icon={Pen} onClick={onEdit} /></div>
                </div>)}
            </div>
        </Card>
    );
}

export default PaymentCard;