import styles from './CreatePaymentModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import Textarea from '../Textarea/Textarea';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CreatePaymentModal = ({ subscriptions, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        subscriptionId: null,
        amount: null,
        paymentMethod: '',
        paymentDate: '',
        note: '',
    });

    useEffect(() => {
        const date = new Date(new Date().setHours(3, 0, 0, 0)).toISOString().split('T')[0];
        if (!isOpen) {
            setFormData({
                subscriptionId: null,
                amount: null,
                paymentMethod: '',
                paymentDate: date,
                note: '',
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        if (field === 'subscriptionId') {
            const sub = subscriptions.find((sub) => sub.id === parseInt(value));
            setFormData(prev => ({ ...prev, amount: sub?.clubService.price }));
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (formData.subscriptionId === undefined || formData.amount === undefined) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новая оплата'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Абонемент"}
                        id={"subscription"}
                        placeholder={'Выберите'}
                        value={formData.subscriptionId || ''}
                        onChange={(e) => handleChange('subscriptionId', e.target.value)}
                        options={subscriptions.filter((sub) => sub.payment === null).map((sub) => ({
                            value: sub.id,
                            label: `${sub.clubService.club.name} - ${sub.clubService.name}`
                        }))}
                        required
                    />
                    <Input
                        label={"Сумма оплаты"}
                        id={"payment"}
                        value={formData.amount || ''}
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
                        value={formData.paymentDate || ''}
                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                        type="date"
                    />
                    <Textarea
                        label={'Примечание'}
                        id={"message"}
                        value={formData.note || ''}
                        onChange={(e) => handleChange('note', e.target.value)}
                        placeholder={"Примечание"}
                    />
                </div>   
                <Button
                    variant='primary'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Добавление...' : 'Добавить'}
                </Button>
            </div>
        </Modal>
    );
}

export default CreatePaymentModal;