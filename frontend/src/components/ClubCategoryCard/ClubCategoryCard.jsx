import styles from './ClubCategoryCard.module.scss';
import { Pen } from 'lucide-react';
import Button from '../Button/Button';
import Tag from '../Tag/Tag';
import Card from '../Card/Card';

const ClubCategoryCard = ({ clubCategory, onEdit, isInModal = false }) => {
    const color = clubCategory.isActive ? 'green' : 'red';
    const text = clubCategory.isActive ? 'Активный' : 'Не активный';

    return (
        <Card isInModal={isInModal}>
            <div className={styles.wrapper}>
                <div className={styles.info}>
                    <h3 className={styles.title}>{clubCategory.name}</h3>
                    <div><Tag text={text} color={color} /></div>
                    <p className={styles.description}>{clubCategory.description ? clubCategory.description : 'Нет описания'}</p>
                </div>
                <div className={styles.buttons}>
                    <div className={styles.button}><Button icon={Pen} variant='primary' onClick={onEdit} /></div>
                </div>
            </div>
        </Card>
    );
}

export default ClubCategoryCard;