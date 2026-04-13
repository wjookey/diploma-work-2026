import styles from './TeacherCard.module.scss';
import { Mail, Phone, Palette, Pen } from 'lucide-react';
import Button from '../Button/Button';

const TeacherCard = ({ name, email, phone, clubs, onEdit }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.personalInfo}>
                <h3 className={styles.name}>{name}</h3>
                <div className={styles.contacts}>
                    <p className={styles.clubs}>{clubs}</p>
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
            <div className={styles.button}>
                <Button icon={Pen} variant='primary' onClick={onEdit} />
            </div>
            
        </div>
    );
}

export default TeacherCard;