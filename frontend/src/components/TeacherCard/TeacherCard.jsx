import styles from './TeacherCard.module.scss';
import { Mail, Phone, Pen } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';

const TeacherCard = ({ teacher, onEdit, isInModal = false }) => {
    let clubs = '';
    for (const club of teacher.teacher.clubs) {
        clubs += `${club.name}, `;
    }
    clubs = clubs.slice(0, -2);

    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.personalInfo}>
                    <h3 className={styles.name}>{teacher.lastName} {teacher.firstName}</h3>
                    <div className={styles.contacts}>
                        <p className={styles.clubs}>{clubs}</p>
                        <div className={styles.email}>
                            <Mail className={styles.icon} />
                            <p>{teacher.email}</p>
                        </div>
                        <div className={styles.phone}>
                            <Phone className={styles.icon} />
                            <p>{teacher.phone}</p>
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

export default TeacherCard;