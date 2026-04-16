import styles from './CreateClubModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Textarea from '../Textarea/Textarea';

const CreateClubModal = ({ categories, teachers, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый кружок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} />
                    <Textarea label={"Описание"} id={"description"} />
                    <div className={styles.details}>
                        <Select
                            label={"Тип занятий"}
                            id={"category"}
                            placeholder={'Выберите'}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name
                            }))}
                        />
                        <Select
                            label={"Преподаватель"}
                            id={"teacher"}
                            placeholder={'Выберите'}
                            options={teachers.map((teacher) => ({
                                value: teacher.teacher.id,
                                label: `${teacher.lastName} ${teacher.firstName}`
                            }))}
                        />
                    </div>
                    <Input label={"Максимальное число участников"} id={"maxStudents"} />
                </div>    
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateClubModal;