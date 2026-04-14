import styles from './ProgressBar.module.scss';
import { CalendarDays } from 'lucide-react';
import { formatDate } from '../../utils/helper';

const ProgressBar = ({ startDate, usedLessons, totalLessons, usedFreezes, totalFreezes }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.startDate}>
                <CalendarDays className={styles.icon} />
                <p className={styles.date}>{startDate === null ? '-' : formatDate(startDate)}</p>
            </div>
            <div className={styles.lessons}>
                <span className={styles.count}>
                    {usedLessons}/{totalLessons}
                </span>
                <div className={styles.progress}>
                    <div className={styles.progressFilled}
                        style={{
                            width: `${Math.min((usedLessons / totalLessons) * 100, 100)}%`,
                            backgroundColor: '#615CF8'
                        }}
                    />
                </div>
            </div>
            <div className={styles.freezes}>
                <span className={styles.count}>
                    {usedFreezes}/{totalFreezes}
                </span>
                <div className={styles.progress}>
                    <div className={styles.progressFilled}
                        style={{
                            width: `${Math.min((usedFreezes / totalFreezes) * 100, 100)}%`,
                            backgroundColor: '#615CF8'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ProgressBar;