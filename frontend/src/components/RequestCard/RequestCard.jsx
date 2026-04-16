import styles from './RequestCard.module.scss';
import Button from '../Button/Button';
import Card from '../Card/Card';
import { CalendarDays } from 'lucide-react';
import ParentCard from '../ParentCard/ParentCard';
import { formatDate } from '../../utils/helper';

const RequestCard = ({ request, onApprove, onReject, onCancel, isForParent = false }) => {
    const parentsItems = request.family.parents.map((parent) => (
        <li key={parent.id}><ParentCard name={`${parent.user.lastName} ${parent.user.firstName}`} email={parent.user.email} phone={parent.user.phone} isEditMode={false} /></li>
    ))
    return (
        <Card>
            <div className={styles.wrapper}>
                <h3 className={styles.name}>{request.child.lastName} {request.child.firstName}</h3>
                <h3 className={styles.request}>{request.clubService.club.name} - {request.clubService.name}</h3>
                {!isForParent && (<div className={styles.parentsBlock}>
                    <h3 className={styles.header}>Parents</h3>
                    <ul className={styles.parents}>
                        {parentsItems}
                    </ul>
                </div>)}
                <div className={styles.date}>
                    <CalendarDays className={styles.icon} />
                    <p>{formatDate(request.createdAt)}</p>
                </div>
                {!isForParent ? (
                    <div className={styles.buttons}>
                        <Button variant='success' onClick={onApprove}>Одобрить</Button>
                        <Button variant='danger' onClick={onReject}>Отклонить</Button>
                    </div>
                ) : (
                    <Button variant='danger' onClick={onCancel}>Отменить</Button>
                )}
            </div>
        </Card>
    );
}

export default RequestCard;