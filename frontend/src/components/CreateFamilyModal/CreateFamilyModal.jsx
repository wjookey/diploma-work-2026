import styles from './CreateFamilyModal.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Phone, Mail, Plus } from 'lucide-react';
import Modal from '../Modal/Modal';
import ParentCard from '../ParentCard/ParentCard';
import ChildCard from '../ChildCard/ChildCard';

const CreateFamilyModal = ({ parents, children, onParentAdd, onChildAdd, onSubmit, isOpen, onClose }) => {
    const parentsItems = parents.map((parent) => (
        <ParentCard
            key={parent.key}
            name={`${parent.lastName} ${parent.firstName}`}
            email={parent.email}
            phone={parent.phone}
            isEditMode={false}
        />
    ));

    const childrenItems = children.map((child) => (
        <ChildCard
            key={child.key}
            name={`${child.lastName} ${child.firstName}`}
            birthDate={child.birthDate}
            isEditMode={false}
            isWatchDetailed={false}
        />
    ));
    return (
        <Modal title={"Новая семья"} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <Input label={'Имя семьи'} id={'famName'} />
                <div className={styles.parentsBlock}>
                    <h3 className={styles.header}>Родители</h3>
                    <div className={styles.inputs}>
                        <div className={styles.name}>
                            <Input label={"Имя"} id={"firstNameP"} />
                            <Input label={"Фамилия"} id={"lastNameP"} />
                        </div>
                        <Input label={"Телефон"} id={"phone"} icon={Phone}/>
                        <Input label={"Почта"} id={"email"} icon={Mail} />
                    </div>
                    <Button variant='outline' onClick={onParentAdd} icon={Plus} />
                    <div className={styles.parents}>
                        {parentsItems}
                    </div>
                </div>
                <div className={styles.childrenBlock}>
                    <h3 className={styles.header}>Дети</h3>
                    <div className={styles.inputs}>
                        <div className={styles.name}>
                            <Input label={"Имя"} id={"firstNameC"} />
                            <Input label={"Фамилия"} id={"lastNameC"} />
                        </div>
                        <Input label={"Дата рождения"} id={"birthDate"} type="date" />
                    </div>
                    <Button variant='outline' onClick={onChildAdd} icon={Plus} />
                    <div className={styles.children}>
                        {childrenItems}
                    </div>
                </div>
                <Button variant='primary' onClick={onSubmit}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateFamilyModal;