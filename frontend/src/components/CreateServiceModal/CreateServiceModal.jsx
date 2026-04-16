import styles from './CreateServiceModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { getSubscriptionType } from '../../utils/helper';

const CreateServiceModal = ({ clubs, isOpen, onClose, onAdd }) => {
    const types = [
      { id: "TRIAL", label: getSubscriptionType("TRIAL") },
      { id: "SINGLE", label: getSubscriptionType("SINGLE") },
      { id: "SUBSCRIPTION", label: getSubscriptionType("SUBSCRIPTION") },
      { id: "CAMP", label: getSubscriptionType("CAMP") },
      { id: "AFTERSCHOOL", label: getSubscriptionType("AFTERSCHOOL") },
    ];

    return (
        <Modal title={'Новая услуга'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} />
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
                        label={"Тип услуги"}
                        id={"type"}
                        placeholder={'Выберите'}
                        options={types.map((type) => ({
                            value: type.id,
                            label: type.label
                        }))}
                    />
                    <Input label={"Цена"} id={"price"} />
                    <div className={styles.details}>
                        <Input label={"Количество занятий"} id={"lessons"} />
                        <Input label={"Количество заморозок"} id={"freezes"} />
                    </div>
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateServiceModal;