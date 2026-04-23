import styles from './EditPaymentModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import Textarea from '../Textarea/Textarea';
import toast from "react-hot-toast";
import DangerModal from "../DangerModal/DangerModal";
import { useState, useEffect } from "react";

const EditPaymentModal = ({ payment, subscriptions, isOpen, onClose, onSubmit, onDelete, loading = false }) => {
    const [formData, setFormData] = useState({
        subscriptionId: null,
        amount: null,
        paymentMethod: '',
        paymentDate: '',
        note: '',
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        const date = payment?.paymentDate ? payment?.paymentDate.split('T')[0] : '';
        if (isOpen && payment) {
            setFormData({
                subscriptionId: payment?.subscriptionId,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                paymentDate: date,
                note: payment.note,
            });
        }
    }, [isOpen, payment]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (formData.amount === undefined) {
            toast.error("Введите все обязательные данные");
            return;
        }
        await onSubmit({ ...payment, ...formData });
    };

    const handleDelete = async () => {
        await onDelete(payment.id);
        setIsDangerModalOpen(false);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать оплату'} isOpen={isOpen} onClose={onClose}>
                <div className={styles.wrapper}>
                    <div className={styles.inputs}>
                        <Select
                            label={"Абонемент"}
                            id={"subscription"}
                            value={formData.subscriptionId}
                            onChange={(e) => handleChange('subscriptionId', e.target.value)}
                            options={subscriptions.filter((sub) => sub.payment === null || sub.id === parseInt(payment?.subscriptionId)).map((sub) => ({
                                value: sub.id,
                                label: `${sub.clubService.club.name} - ${sub.clubService.name}`
                            }))}
                            disabled
                        />
                        <Input
                            label={"Сумма оплаты"}
                            id={"payment"}
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            placeholder={"Сумма оплаты"}
                            type="number"
                            required
                        />
                        <Select
                            label={"Способ оплаты"}
                            id={"method"}
                            placeholder={'Выберите'}
                            value={formData.paymentMethod || ''}
                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                            options={[
                                { value: 'Наличные', label: 'Наличные' },
                                { value: 'Перевод', label: 'Перевод' },
                                { value: 'Карта', label: 'Карта' },
                            ]}
                        />
                        <Input
                            label={"Дата"}
                            id={"date"}
                            type="date"
                            value={formData.paymentDate || ''}
                            onChange={(e) => handleChange('paymentDate', e.target.value)}
                        />
                        <Textarea
                            label={'Примечание'}
                            id={"message"}
                            value={formData.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            placeholder={"Примечание"}
                        />
                    </div>   
                    <div className={styles.buttons}>
                        <Button
                            variant='primary'
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button
                            variant='danger'
                            onClick={() => setIsDangerModalOpen(true)}
                            disabled={loading}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>
            <DangerModal
                isOpen={isDangerModalOpen}
                onClose={() => setIsDangerModalOpen(false)}
                onDelete={handleDelete}
            />
        </>
    );
}

export default EditPaymentModal;