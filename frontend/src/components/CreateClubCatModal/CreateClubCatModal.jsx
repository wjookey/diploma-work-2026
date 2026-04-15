import styles from './CreateClubCatModal.module.scss';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';

const CreateClubCatModal = ({ isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый тип занятий'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} />
                    <Input label={"Описание"} id={"description"} />
                </div>    
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateClubCatModal;