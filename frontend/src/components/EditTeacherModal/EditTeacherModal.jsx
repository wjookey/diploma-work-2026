import styles from './EditTeacherModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Phone } from 'lucide-react';

const EditTeacherModal = ({ user, onSubmit, onDelete, isOpen, onClose }) => {
    return (
        <Modal title={'Редактировать преподавателя'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input label={"Имя"} id={"firstName"} value={user.firstName} />
                        <Input label={"Фамилия"} id={"lastName"} value={user.lastName} />
                    </div>
                    <Input label={"Телефон"} id={"phone"} icon={Phone} value={user.phone}/>
                    <Input label={"Почта"} id={"email"} icon={Mail} value={user.email} />
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить преподавателя</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditTeacherModal;