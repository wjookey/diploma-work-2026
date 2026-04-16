import styles from './CreateLessonModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';

const CreateLessonModal = ({ clubs, teachers, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый урок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                    />
                    <Input label={"Дата"} id={"date"} type="date" />
                    <div className={styles.details}>
                        <Input label={"Время начала"} id={"startTime"} type="time"/>
                        <Input label={"Время конца"} id={"endTime"} type="time" />
                    </div>
                    <Select
                        label={"Учитель"}
                        id={"teacher"}
                        placeholder={'Выберите'}
                        options={teachers.map((teacher) => ({
                            value: teacher.teacher.id,
                            label: `${teacher.lastName} ${teacher.firstName}`
                        }))}
                    />
                    <Input label={"Кабинет"} id={"room"} />
                    <Input label={"Тема занятия"} id={"topic"} />
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateLessonModal;