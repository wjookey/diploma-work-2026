import styles from './EditClubCatModal.module.scss';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Textarea from '../Textarea/Textarea';

const EditClubCatModal = ({ category, onSubmit, onDelete, isOpen, onClose }) => {
    return (
        <Modal title={'Редактировать тип занятий'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} value={category.name} />
                    <Textarea label={"Описание"} id={"description"} value={category.description} />
                    <Select
                        label={"Статус"}
                        id={"status"}
                        placeholder={category.isActive ? 'Активный' : 'Не активный'}
                        options={[
                            { value: 0, label: "Не активный" },
                            { value: 1, label: "Активный" },
                        ]}
                    />
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditClubCatModal;