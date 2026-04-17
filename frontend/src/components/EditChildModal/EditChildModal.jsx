import styles from './EditChildModal.module.scss';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';

const EditChildModal = ({ child, familyName, families, onSubmit, onDelete, isOpen, onClose }) => {
    return (
        <Modal title={'Редактировать ребёнка'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input label={"Имя"} id={"firstName"} value={child?.firstName} />
                        <Input label={"Фамилия"} id={"lastName"} value={child?.lastName} />
                    </div>
                    <Input label={"Дата рождения"} id={"birthDate"} value={child?.birthDate.split('T')[0]} type="date"/>
                    <Select
                        label={"Семья"}
                        id={"family"}
                        placeholder={familyName}
                        options={families.map((fam) => ({
                            value: fam.id,
                            label: fam.familyName
                        }))}
                    />
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить ребёнка</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditChildModal;