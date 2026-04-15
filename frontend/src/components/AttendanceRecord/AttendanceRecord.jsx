import styles from './AttendanceRecord.module.scss';
import { Check, X } from 'lucide-react';

const AttendanceRecord = ({ name, isPresent, onToggle }) => {
    return (
        <div className={`${styles.wrapper} ${isPresent ? styles.present : ''}`}  onClick={onToggle}>
            <div className={styles.left}>
                <div className={`${styles.status} ${isPresent ? styles.present : ''}`}>
                    {isPresent ? <Check className={styles.icon} /> : <X className={styles.icon} />}
                </div>
                <span className={styles.name}>{name}</span>
            </div>
            <span className={`${styles.presence} ${isPresent ? styles.present : ''}`}>
                {isPresent ? 'Присутствует' : 'Отсутствует'}
            </span>
        </div>
    );
}

export default AttendanceRecord