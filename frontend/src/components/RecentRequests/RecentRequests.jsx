import styles from './RecentRequests.module.scss';
import Card from '../Card/Card';
import { FileText } from 'lucide-react';
import Tag from '../Tag/Tag';
import { getSubscriptionType } from '../../utils/helper';

const RecentRequests = ({requests}) => {
    const requestItems = requests.map((request) => (
        <li key={request.id}>
            <div className={styles.info}>
                <div className={styles.infoText}>
                    <p className={styles.family}>{request.family.familyName} → {request.child.lastName} {request.child.firstName}</p>
                    <p className={styles.club}>{request.clubService.club.name}</p>
                </div>
                <div className={styles.tag}><Tag text={getSubscriptionType(request.clubService.type)} /></div>
            </div>
        </li>
    ));

    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.title}>
                    <FileText className={styles.icon} />
                    <p className={styles.text}>Ожидающие заявки</p>
                </div>
                {requestItems.length > 0 ? (<ul className={styles.list}>
                    {requestItems}
                </ul>
                ) : (
                    <p className={styles.subtext}>Нет заявок</p>
                )}
            </div>
        </Card>
    );
}

export default RecentRequests;