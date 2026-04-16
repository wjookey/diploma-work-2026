import styles from './ScheduleCard.module.scss';
import { Pen, GraduationCap, AlarmClock, MapPin } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';

const ScheduleCard = ({ record, onEdit, isInModal = false }) => {
    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.scheduleInfo}>
                    <h3 className={styles.clubName}>{record.club.name}</h3>
                    <div className={styles.details}>
                        <div className={styles.time}>
                            <AlarmClock className={styles.icon} />
                            <p>{record.startTime} - {record.endTime}</p>
                        </div>
                        <div className={styles.teacher}>
                            <GraduationCap className={styles.icon} />
                            <p>{record.club.teacher.user.lastName} {record.club.teacher.user.firstName}</p>
                        </div>
                        <div className={styles.room}>
                            <MapPin className={styles.icon} />
                            <p>{record.room !== null ? record.room : '-'}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.button}>
                    <Button icon={Pen} variant='primary' onClick={onEdit} />
                </div>
            </div>
        </Card>
    );
}

export default ScheduleCard;