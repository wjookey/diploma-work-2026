import styles from './EditSubscriptionModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import { SUBSCRIPTION_STATUS, getSubscriptionStatus } from '../../utils/helper';

const EditSubscriptionModal = ({ subscription, children, clubs, services, isOpen, onClose, onSubmit, onDelete }) => {
    return (
        <Modal title={'Редактировать абонемент'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Ребёнок"}
                        id={"child"}
                        placeholder={`${subscription?.child?.lastName} ${subscription?.child?.firstName}`}
                        options={children.map((child) => ({
                            value: child.id,
                            label: `${child.lastName} ${child.firstName}`
                        }))}
                        disabled
                    />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={subscription?.clubService?.club?.name}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        disabled
                    />
                    <Select
                        label={"Услуга"}
                        id={"service"}
                        placeholder={subscription?.clubService?.name}
                        options={services.map((service) => ({
                            value: service.id,
                            label: service.name
                        }))}
                        disabled
                    />
                    <div className={styles.details}>
                        <Input label={"Осталось занятий"} id={"lessons"} value={subscription?.remainingLessons} disabled={subscription?.status === 'PENDING' || subscription?.status === 'CANCELLED'} />
                        <Input label={"Осталось заморозок"} id={"freezes"} value={subscription?.clubService?.freezedLesson - subscription?.usedFreezes} disabled={subscription?.status === 'PENDING' || subscription?.status === 'CANCELLED'} />
                    </div>
                    <Select
                        label={"Статус"}
                        id={"status"}
                        placeholder={subscription?.status ? getSubscriptionStatus(subscription?.status) : ''}
                        options={SUBSCRIPTION_STATUS.filter((subSt) => subSt.value !== 'CANCELLED' && subSt.value !== 'PENDING').map((lessonSt) => ({
                            value: lessonSt.value,
                            label: lessonSt.label
                        }))}
                        disabled={subscription?.status === 'PENDING' || subscription?.status === 'CANCELLED'}
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

export default EditSubscriptionModal;