import styles from './EditScheduleRecModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { DAYS_OF_WEEK, getDayName } from '../../utils/helper';

const EditScheduleRecModal = ({ record, clubs, isOpen, onClose, onSubmit, onDelete }) => {
    return (
        <Modal title={'Редактировать запись в расписании'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={record.club.name}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                    />
                    <Select
                        label={"День недели"}
                        id={"dayOfWeek"}
                        placeholder={getDayName(record.dayOfWeek)}
                        options={DAYS_OF_WEEK.map((day) => ({
                            value: day.value,
                            label: day.label
                        }))}
                    />
                    <div className={styles.details}>
                        <Input label={"Время начала"} id={"startTime"} value={record.startTime} type="time"/>
                        <Input label={"Время конца"} id={"endTime"} value={record.endTime} type="time" />
                    </div>
                    <Input label={"Кабинет"} id={"room"} value={record.room === null ? '' : record.room} />
                </div>   
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditScheduleRecModal;