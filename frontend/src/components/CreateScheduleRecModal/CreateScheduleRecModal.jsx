import styles from './CreateScheduleRecModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { DAYS_OF_WEEK } from '../../utils/helper';

const CreateScheduleRecModal = ({ clubs, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новая запись в расписании'} isOpen={isOpen} onClose={onClose}>
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
                    <Select
                        label={"День недели"}
                        id={"dayOfWeek"}
                        placeholder={'Выберите'}
                        options={DAYS_OF_WEEK.map((day) => ({
                            value: day.value,
                            label: day.label
                        }))}
                    />
                    <div className={styles.details}>
                        <Input label={"Время начала"} id={"startTime"} type="time"/>
                        <Input label={"Время конца"} id={"endTime"} type="time" />
                    </div>
                    <Input label={"Кабинет"} id={"room"} />
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateScheduleRecModal;