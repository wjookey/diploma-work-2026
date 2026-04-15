import styles from './EditParentModal.module.scss';
import Select from '../Select/Select';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { Mail, Phone } from 'lucide-react';

const EditParentModal = ({ user, families, onSubmit, onDelete, isOpen, onClose }) => {
    return (
        <Modal title={'Редактировать родителя'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input label={"Имя"} id={"firstName"} value={user.firstName} />
                        <Input label={"Фамилия"} id={"lastName"} value={user.lastName} />
                    </div>
                    <Input label={"Телефон"} id={"phone"} icon={Phone} value={user.phone}/>
                    <Input label={"Почта"} id={"email"} icon={Mail} value={user.email} />
                    <Select
                        label={"Семья"}
                        id={"family"}
                        placeholder={user.parent.family.familyName}
                        options={families.map((fam) => ({
                            value: fam.id,
                            label: fam.familyName
                        }))}
                    />
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить родителя</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditParentModal;