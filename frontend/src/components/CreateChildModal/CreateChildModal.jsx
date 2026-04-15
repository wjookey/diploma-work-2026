import styles from './CreateChildModal.module.scss';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';

const CreateChildModal = ({ isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый ребёнок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input label={"Имя"} id={"firstName"} />
                        <Input label={"Фамилия"} id={"lastName"} />
                    </div>
                    <Input label={"Дата рождения"} id={"birthDate"} type="date" />
                </div>    
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateChildModal;