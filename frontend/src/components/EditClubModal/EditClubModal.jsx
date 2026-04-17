import styles from './EditClubModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Textarea from '../Textarea/Textarea';

const EditClubModal = ({ club, categories, teachers, isOpen, onClose, onSubmit, onDelete }) => {
    return (
        <Modal title={'Редактировать кружок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} value={club?.name} />
                    <Textarea label={"Описание"} id={"description"} value={club?.description} />
                    <div className={styles.details}>
                        <Select
                            label={"Тип занятий"}
                            id={"category"}
                            placeholder={club?.clubCategory?.name}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name
                            }))}
                        />
                        <Select
                            label={"Преподаватель"}
                            id={"teacher"}
                            placeholder={`${club?.teacher?.user?.lastName} ${club?.teacher?.user?.firstName}`}
                            options={teachers.map((teacher) => ({
                                value: teacher.teacher.id,
                                label: `${teacher.lastName} ${teacher.firstName}`
                            }))}
                        />
                    </div>
                    <Input label={"Максимальное число участников"} id={"maxStudents"} value={club?.maxStudents === null ? '' : club?.maxStudents} />
                    <Select
                        label={"Статус"}
                        id={"status"}
                        placeholder={club?.isActive ? 'Активный' : 'Не активный'}
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

export default EditClubModal;