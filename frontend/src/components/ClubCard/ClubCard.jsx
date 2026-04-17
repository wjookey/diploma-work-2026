import styles from './ClubCard.module.scss';
import Tag from '../Tag/Tag';
import Button from '../Button/Button';
import { Pen, GraduationCap, Users } from 'lucide-react';
import Card from '../Card/Card';

const ClubCard = ({ club, onEdit, isInModal = false }) => {
    const color = club.isActive ? "green" : "red";
    const text = club.isActive ? "Активный" : "Не активный";

    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.info}>
                    <h3 className={styles.title}>{club.name}</h3>
                    <div className={styles.tags}>
                        <Tag text={club.clubCategory.name} color={'purple'} />
                        <Tag text={text} color={color} />
                    </div>
                    <p className={styles.description}>{club.description !== null ? club.description : 'Нет описания'}</p>
                    <div className={styles.aboutClub}>
                        <div className={styles.teacher}>
                            <GraduationCap className={styles.icon} />
                            <p>{club.teacher.user.lastName} {club.teacher.user.firstName}</p>
                        </div>
                        <div className={styles.clients}>
                            <Users className={styles.icon} />
                            <p>Макс. {club.maxStudents !== null ? club.maxStudents : '-'} учеников</p>
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <div className={styles.button}><Button icon={Pen} variant='primary' onClick={onEdit} /></div>
                </div>
            </div>
        </Card>
    );
}

export default ClubCard;