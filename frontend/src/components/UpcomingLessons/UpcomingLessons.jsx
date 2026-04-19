import styles from './UpcomingLessons.module.scss';
import Card from '../Card/Card';
import { AlarmClock, GraduationCap } from 'lucide-react';

const UpcomingLessons = ({lessons}) => {
    const lessonItems = lessons.map((l) => (
        <li key={l.id}>
            <div className={styles.scheduleInfo}>
                <h3 className={styles.clubName}>{l?.club?.name}</h3>
                <div className={styles.details}>
                    <div className={styles.time}>
                        <p>{l?.startTime} - {l?.endTime}</p>
                        <AlarmClock className={styles.icon} />
                    </div>
                    <div className={styles.teacher}>
                        <p>{l?.teacher.user.lastName} {l?.teacher.user.firstName}</p>
                        <GraduationCap className={styles.icon} />
                    </div>
                </div>
            </div>
        </li>
    ));

    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.title}>
                    <AlarmClock className={styles.icon} />
                    <p className={styles.text}>Ближайшие занятия</p>
                </div>
                {lessonItems.length > 0 ? (<ul className={styles.list}>
                    {lessonItems}
                </ul>
                ) : (
                    <p className={styles.subtext}>Нет предстоящих занятий</p>
                )}
            </div>
        </Card>
    );
}

export default UpcomingLessons;