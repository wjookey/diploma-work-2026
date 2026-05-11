import styles from './ClubServiceCard.module.scss';
import { Pen, GraduationCap, Clipboard, CreditCard } from 'lucide-react';
import Tag from '../Tag/Tag';
import Button from '../Button/Button';
import Card from '../Card/Card';

const ClubServiceCard = ({ clubService, isEditMode = true, onEdit, isInModal = false }) => {
    const color = clubService?.isActive ? "green" : "red";
    const text = clubService?.isActive ? "Активный" : "Не активный";

    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.info}>
                    <h3 className={styles.title}>{clubService?.club.name} - {clubService?.name}</h3>
                    <div className={styles.tags}>
                        <Tag text={clubService?.club?.clubCategory?.name} color={'purple'} />
                        <Tag text={text} color={color} />
                    </div>
                    <p className={styles.description}>{clubService?.club?.description !== null ? clubService?.club?.description : 'Нет описания'}</p>
                    <div className={styles.aboutService}>
                        <div className={styles.teacher}>
                            <GraduationCap className={styles.icon} />
                            <p>{!clubService?.club.dayClasses ? `${clubService?.club?.teacher?.user?.lastName} ${clubService?.club?.teacher?.user?.firstName}` : '-'}</p>
                        </div>
                        <div className={styles.included}>
                            <div className={styles.lessons}>
                                <Clipboard className={styles.icon} />
                                <p>Занятий: {clubService?.subscriptionLessons}</p>
                            </div>
                            <div className={styles.freezes}>
                                <Clipboard className={styles.icon} />
                                <p>Заморозок: {clubService?.freezedLesson}</p>
                            </div>
                        </div>
                        <span className={styles.isCombo}>Комбо абонемент: {clubService.isCombo ? "да" : "нет"}</span>
                        <div className={styles.price}>
                            <CreditCard className={styles.icon} />
                            <p>{clubService?.price} руб</p>
                        </div>
                    </div>
                </div>
                {isEditMode && (<div className={styles.buttons}>
                    <div className={styles.button}><Button icon={Pen} variant='primary' onClick={onEdit} /></div>
                </div>)}
            </div>
        </Card>
    );
}

export default ClubServiceCard;