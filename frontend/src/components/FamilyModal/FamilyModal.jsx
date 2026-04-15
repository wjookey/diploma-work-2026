import styles from './FamilyModal.module.scss';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import ParentCard from '../ParentCard/ParentCard';
import ChildCard from '../ChildCard/ChildCard';

const FamilyModal = ({ familyName, parents, children, onEdit, onAdd, onDelete, isOpen, onClose }) => {
    const parentsItems = parents.map((parent) => (
        <li key={parent.key}><ParentCard name={`${parent.lastName} ${parent.firstName}`} email={parent.email} phone={parent.phone} isEditMode={true} onEdit={onEdit} /></li>
    ));

    const childrenItems = children.map((child) => (
        <li key={child.key}><ChildCard name={`${child.lastName} ${child.firstName}`} birthDate={child.birthDate} isEditMode={true} onEdit={onEdit} /></li>
    ));

    return (
        <Modal title={familyName} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.familyMembers}>
                    <div className={styles.parentsBlock}>
                        <h3 className={styles.header}>Parents</h3>
                        <ul className={styles.parents}>
                            {parentsItems}
                        </ul>
                        <Button variant='primary' onClick={onAdd}>Добавить родителя</Button>
                    </div>
                    <div className={styles.childrenBlock}>
                        <h3 className={styles.header}>Children</h3>
                        <ul className={styles.children}>
                            {childrenItems}
                        </ul>
                        <Button variant='primary' onClick={onAdd}>Добавить ребёнка</Button>
                    </div>
                </div>
                <Button variant='danger' onClick={onDelete}>Удалить семью</Button>
            </div>
        </Modal>
    );
}

export default FamilyModal;
