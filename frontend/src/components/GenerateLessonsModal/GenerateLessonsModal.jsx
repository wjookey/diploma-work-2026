import styles from './GenerateLessonsModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';

const GenerateLessonsModal = ({ isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новая запись в расписании'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.details}>
                        <Input label={"Дата начала"} id={"startDay"} type="date"/>
                        <Input label={"Дата конца"} id={"endDay"} type="date" />
                    </div>
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default GenerateLessonsModal;