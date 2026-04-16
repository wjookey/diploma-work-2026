import styles from './EditPaymentModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import Textarea from '../Textarea/Textarea';

const EditPaymentModal = ({ payment, subscriptions, isOpen, onClose, onSubmit, onDelete }) => {
    return (
        <Modal title={'Редактировать оплату'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Абонемент"}
                        id={"subscription"}
                        placeholder={`${payment.subscription.clubService.club.name} - ${payment.subscription.clubService.name}`}
                        options={subscriptions.map((sub) => ({
                            value: sub.id,
                            label: `${sub.clubService.club.name} - ${sub.clubService.name}`
                        }))}
                        disabled
                    />
                    <Input label={"Сумма оплаты"} id={"payment"} value={payment.amount} />
                    <Select
                        label={"Способ оплаты"}
                        id={"method"}
                        placeholder={payment.paymentMethod}
                        options={[
                            { value: 'Наличные', label: 'Наличные' },
                            { value: 'Перевод', label: 'Перевод' },
                            { value: 'Карта', label: 'Карта' },
                        ]}
                    />
                    <Input label={"Дата"} id={"date"} type="date" value={payment.paymentDate.split('T')[0]} />
                    <Textarea label={'Примечание'} id={"message"} value={payment.note === null ? '' : payment.note} />
                </div>   
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={onSubmit}>Сохранить</Button>
                    <Button variant='danger' onClick={onDelete}>Удалить</Button>
                </div>
            </div>
        </Modal>
    );
}

export default EditPaymentModal;