import styles from './EditServiceModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { getSubscriptionType } from "../../utils/helper";

const EditServiceModal = ({ service, clubs, isOpen, onClose, onSubmit, onDelete }) => {
    const types = [
        { id: "TRIAL", label: getSubscriptionType("TRIAL") },
        { id: "SINGLE", label: getSubscriptionType("SINGLE") },
        { id: "SUBSCRIPTION", label: getSubscriptionType("SUBSCRIPTION") },
        { id: "CAMP", label: getSubscriptionType("CAMP") },
        { id: "AFTERSCHOOL", label: getSubscriptionType("AFTERSCHOOL") },
    ];

    return (
        <Modal title={'Редактировать услугу'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input label={"Название"} id={"name"} value={service.name} />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={service.club.name}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                    />
                    <Select
                        label={"Тип услуги"}
                        id={"type"}
                        placeholder={getSubscriptionType(service.type)}
                        options={types.map((type) => ({
                            value: type.id,
                            label: type.label
                        }))}
                    />
                    <Input label={"Цена"} id={"price"} value={service.price} />
                    <div className={styles.details}>
                        <Input label={"Количество занятий"} id={"lessons"} value={service.subscriptionLessons} />
                        <Input label={"Количество заморозок"} id={"freezes"} value={service.freezedLesson} />
                    </div>
                    <Select
                        label={"Статус"}
                        id={"status"}
                        placeholder={service.isActive ? 'Активная' : 'Не активная'}
                        options={[
                            { value: 0, label: "Не активная" },
                            { value: 1, label: "Активная" },
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

export default EditServiceModal;