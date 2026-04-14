import styles from './ChildCard.module.scss';
import { Eye, Pen, Cake } from 'lucide-react';
import Button from '../Button/Button';

const ChildCard = ({ name, birthDate, onEdit, onWatchDetailed, isEditMode }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.personalInfo}>
                <h3 className={styles.name}>{name}</h3>
                <div className={styles.contacts}>
                    <div className={styles.birthDate}>
                        <Cake className={styles.icon} />
                        <p>{birthDate}</p>
                    </div>
                </div>
            </div>
            <div className={styles.button}>
                <Button icon={isEditMode ? Pen : Eye} variant='primary' onClick={isEditMode ? onEdit : onWatchDetailed} />
            </div>
        </div>
    );
}

export default ChildCard;