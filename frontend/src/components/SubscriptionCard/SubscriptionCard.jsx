import styles from './SubscriptionCard.module.scss';
import Tag from '../Tag/Tag';
import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import { Eye, Pen } from 'lucide-react';
import Card from '../Card/Card';
import { getSubscriptionType, getSubscriptionStatus, getSubPaymentStatus } from '../../utils/helper';

const SubscriptionCard = ({ subscription, isEditMode = true, onEdit, onWatchDetailed }) => {
    const typeColor = subscription.status === 'ACTIVE' ? 'green' : subscription.status === 'PENDING' ? 'purple' : 'red';
    const paymentColor = subscription.payment === null ? 'red' : 'green';
    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.info}>
                    <h3 className={styles.name}>{subscription.child.lastName} {subscription.child.firstName}</h3>
                    <div className={styles.sub}>
                        <h3 className={styles.club}>{subscription.clubService.club.name}</h3>
                        <div className={styles.tags}>
                            <Tag text={getSubscriptionType(subscription.clubService.type)} color='purple' />
                            <Tag text={getSubscriptionStatus(subscription.status)} color={typeColor} />
                            <Tag text={getSubPaymentStatus(subscription.payment)} color={paymentColor} />
                        </div>
                        <ProgressBar
                            startDate={subscription.startDate}
                            usedLessons={subscription.clubService.subscriptionLessons - subscription.remainingLessons}
                            totalLessons={subscription.clubService.subscriptionLessons}
                            usedFreezes={subscription.usedFreezes}
                            totalFreezes={subscription.clubService.freezedLesson}
                        />
                    </div>
                </div>
                <div className={styles.buttons}>
                    {isEditMode && <div className={styles.button}><Button variant='primary' icon={Pen} onClick={onEdit} /></div>}
                    <div className={styles.button}><Button variant='primary' icon={Eye} onClick={onWatchDetailed} /></div>
                </div>
            </div>
        </Card>
    );
}

export default SubscriptionCard;