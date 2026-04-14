import styles from './FamilyCard.module.scss';
import Button from '../Button/Button';
import Card from '../Card/Card';
import ParentCard from '../ParentCard/ParentCard';
import ChildCard from '../ChildCard/ChildCard';

const FamilyCard = ({ familyName, parents, children, onEdit, onWatchDetailed }) => {
    const parentsItems = parents.map((parent) => (
        <li key={parent.key}><ParentCard name={`${parent.lastName} ${parent.firstName}`} email={parent.email} phone={parent.phone} isEditMode={false} /></li>
    ));

    const childrenItems = children.map((child) => (
        <li key={child.key}><ChildCard name={`${child.lastName} ${child.firstName}`} birthDate={child.birthDate} onWatchDetailed={onWatchDetailed} isEditMode={false}/></li>
    ));

    return (
        <Card>
            <div className={styles.wrapper}>
                <h2 className={styles.title}>{familyName}</h2>
                <div className={styles.familyMembers}>
                    <div className={styles.parentsBlock}>
                        <h3 className={styles.header}>Parents</h3>
                        <ul className={styles.parents}>
                            {parentsItems}
                        </ul>
                    </div>
                    <div className={styles.childrenBlock}>
                        <h3 className={styles.header}>Children</h3>
                        <ul className={styles.children}>
                            {childrenItems}
                        </ul>
                    </div>
                </div>
                <Button variant='primary' onClick={onEdit}>Редактировать</Button>
            </div>
        </Card>
    );
}

export default FamilyCard;
