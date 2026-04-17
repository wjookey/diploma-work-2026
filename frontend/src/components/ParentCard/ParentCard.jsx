import styles from './ParentCard.module.scss';
import Button from '../Button/Button';
import { Pen, Mail, Phone } from 'lucide-react';

const ParentCard = ({ name, email, phone, onEdit, isEditMode }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.personalInfo}>
                <h3 className={styles.name}>{name}</h3>
                <div className={styles.contacts}>
                    <div className={styles.email}>
                        <Mail className={styles.icon} />
                        <p>{email}</p>
                    </div>
                    <div className={styles.phone}>
                        <Phone className={styles.icon} />
                        <p>{phone}</p>
                    </div>
                </div>
            </div>
            <div className={styles.buttons}>
                {isEditMode && <div className={styles.button}><Button icon={Pen} variant='primary' onClick={onEdit} /></div>}
            </div>
        </div>
    );
}

export default ParentCard;