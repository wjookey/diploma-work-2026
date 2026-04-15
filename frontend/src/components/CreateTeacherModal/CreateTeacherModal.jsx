import styles from './CreateTeacherModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Phone } from 'lucide-react';

const CreateTeacherModal = ({ isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый преподаватель'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input label={"Имя"} id={"firstName"} />
                        <Input label={"Фамилия"} id={"lastName"} />
                    </div>
                    <Input label={"Телефон"} id={"phone"} icon={Phone}/>
                    <Input label={"Почта"} id={"email"} icon={Mail} />
                </div>    
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateTeacherModal;