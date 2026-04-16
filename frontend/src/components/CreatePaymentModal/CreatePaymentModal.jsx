import styles from './CreatePaymentModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import Textarea from '../Textarea/Textarea';

const CreatePaymentModal = ({ subscriptions, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новая оплата'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Абонемент"}
                        id={"subscription"}
                        placeholder={'Выберите'}
                        options={subscriptions.map((sub) => ({
                            value: sub.id,
                            label: `${sub.clubService.club.name} - ${sub.clubService.name}`
                        }))}
                    />
                    <Input label={"Сумма оплаты"} id={"payment"} />
                    <Select
                        label={"Способ оплаты"}
                        id={"method"}
                        placeholder={'Выберите'}
                        options={[
                            { value: 'Наличные', label: 'Наличные' },
                            { value: 'Перевод', label: 'Перевод' },
                            { value: 'Карта', label: 'Карта' },
                        ]}
                    />
                    <Input label={"Дата"} id={"date"} type="date" />
                    <Textarea label={'Примечание'} id={"message"} />
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreatePaymentModal;