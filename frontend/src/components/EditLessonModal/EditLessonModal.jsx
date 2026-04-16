import styles from './EditLessonModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { LESSON_STATUS, getLessonStatus } from '../../utils/helper';

const EditLessonModal = ({ lesson, clubs, teachers, isOpen, onClose, onSubmit, onDelete }) => {
    return (
        <Modal title={'Редактировать урок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={lesson.club.name}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'}
                    />
                    <Input label={"Дата"} id={"date"} type="date" value={lesson.date.split('T')[0]} disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'} />
                    <div className={styles.details}>
                        <Input label={"Время начала"} id={"startTime"} type="time" value={lesson.startTime} disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'}/>
                        <Input label={"Время конца"} id={"endTime"} type="time" value={lesson.endTime} disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'} />
                    </div>
                    <Select
                        label={"Учитель"}
                        id={"teacher"}
                        placeholder={`${lesson.teacher.user.lastName} ${lesson.teacher.user.firstName}`}
                        options={teachers.map((teacher) => ({
                            value: teacher.teacher.id,
                            label: `${teacher.lastName} ${teacher.firstName}`
                        }))}
                        disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'}
                    />
                    <Input label={"Кабинет"} id={"room"} value={lesson.room === null ? '' : lesson.room} disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'} />
                    <Input label={"Тема занятия"} id={"topic"} value={lesson.topic === null ? '' : lesson.topic} disabled={lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED'}/>
                    <Select
                        label={"Статус"}
                        id={"status"}
                        placeholder={getLessonStatus(lesson.status)}
                        options={LESSON_STATUS.filter((lessonSt) => lessonSt.value !== 'COMPLETED').map((lessonSt) => ({
                            value: lessonSt.value,
                            label: lessonSt.label
                        }))}
                        disabled={lesson.status === 'COMPLETED'}
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

export default EditLessonModal;