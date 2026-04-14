import styles from './ChildSubscriptionCard.module.scss';
import Tag from '../Tag/Tag';
import ProgressBar from '../ProgressBar/ProgressBar';
import { getSubscriptionType, getSubscriptionStatus } from '../../utils/helper';

const ChildSubscriptionCard = ({ subDetails }) => {
    const color = subDetails.status === 'ACTIVE' ? 'green' : subDetails.status === 'PENDIND' ? 'purple' : 'red';
    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>{subDetails.clubService.club.name}</h3>
            <div className={styles.subTags}>
                <Tag color='purple' text={getSubscriptionType(subDetails.clubService.type)} />
                <Tag color={color} text={getSubscriptionStatus(subDetails.status)} />
            </div>
            <ProgressBar
                startDate={subDetails.startDate}
                usedLessons={subDetails.clubService.subscriptionLessons - subDetails.remainingLessons}
                totalLessons={subDetails.clubService.subscriptionLessons}
                usedFreezes={subDetails.usedFreezes}
                totalFreezes={subDetails.clubService.freezedLesson}
            />
        </div>
    );
}

export default ChildSubscriptionCard;