import styles from './FamilyModal.module.scss';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import ParentCard from '../ParentCard/ParentCard';
import ChildCard from '../ChildCard/ChildCard';
import { formatDate } from '../../utils/helper';

const FamilyModal = ({ familyName, parents, children, onParentEdit, onChildEdit, onParentAdd, onChildAdd, onDelete, isOpen, onClose, isAdminMode = true }) => {
    const parentsItems = parents?.map((parent) => (
        <li key={parent?.id}><ParentCard name={`${parent?.user?.lastName} ${parent?.user?.firstName}`} email={parent?.user?.email} phone={parent?.user?.phone} isEditMode={true} onEdit={() => onParentEdit(parent)} /></li>
    ));

    const childrenItems = children.map((child) => (
        <li key={child?.id}><ChildCard name={`${child?.lastName} ${child?.firstName}`} birthDate={formatDate(child?.birthDate)} isEditMode={true} isWatchDetailed={false} onEdit={() => onChildEdit(child)} /></li>
    ));

    return (
        <Modal title={familyName} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.familyMembers}>
                    <div className={styles.parentsBlock}>
                        <h3 className={styles.header}>Родители</h3>
                        <ul className={styles.parents}>
                            {parentsItems}
                        </ul>
                        <Button variant='primary' onClick={onParentAdd}>Добавить родителя</Button>
                    </div>
                    <div className={styles.childrenBlock}>
                        <h3 className={styles.header}>Дети</h3>
                        <ul className={styles.children}>
                            {childrenItems}
                        </ul>
                        <Button variant='primary' onClick={onChildAdd}>Добавить ребёнка</Button>
                    </div>
                </div>
                {isAdminMode && (<Button variant='danger' onClick={onDelete}>Удалить семью</Button>)}
            </div>
        </Modal>
    );
}

export default FamilyModal;
