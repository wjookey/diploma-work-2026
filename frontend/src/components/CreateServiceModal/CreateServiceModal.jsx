import styles from './CreateServiceModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { getSubscriptionType } from '../../utils/helper';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CreateServiceModal = ({ clubs, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        clubId: null,
        type: '',
        price: null,
        subscriptionLessons: null,
        freezedLesson: null,
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                clubId: null,
                type: '',
                price: null,
                subscriptionLessons: null,
                freezedLesson: null,
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.clubId || !formData.type || !formData.price || !formData.subscriptionLessons || !formData.freezedLesson) {
            toast.error("Заполните все поля");
            return;
        }
        await onAdd(formData);
    }

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
                    <Input
                        label={"Название"}
                        id={"name"}
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={"Название"}
                        required
                    />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        value={formData.clubId || ''}
                        onChange={(e) => handleChange('clubId', e.target.value)}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        required
                    />
                    <Select
                        label={"Тип услуги"}
                        id={"type"}
                        placeholder={'Выберите'}
                        value={formData.type || ''}
                        onChange={(e) => handleChange('type', e.target.value)}
                        options={types.map((type) => ({
                            value: type.id,
                            label: type.label
                        }))}
                        required
                    />
                    <Input
                        label={"Цена"}
                        id={"price"}
                        value={formData.price || ''}
                        onChange={(e) => handleChange('price', e.target.value)}
                        placeholder={"Цена"}
                        required
                    />
                    <div className={styles.details}>
                        <Input
                            label={"Количество занятий"}
                            id={"lessons"}
                            value={formData.subscriptionLessons || ''}
                            onChange={(e) => handleChange('subscriptionLessons', e.target.value)}
                            placeholder={"Количество занятий"}
                            required
                        />
                        <Input
                            label={"Количество заморозок"}
                            id={"freezes"}
                            value={formData.freezedLesson || ''}
                            onChange={(e) => handleChange('freezedLesson', e.target.value)}
                            placeholder={"Количество заморозок"}
                            required
                        />
                    </div>
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

export default CreateServiceModal;