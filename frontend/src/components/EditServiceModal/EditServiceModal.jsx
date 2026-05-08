import styles from './EditServiceModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { getSubscriptionType } from "../../utils/helper";
import toast from 'react-hot-toast';
import DangerModal from '../DangerModal/DangerModal';
import { useState, useEffect } from 'react';
import Radiobutton from '../Radiobutton/Radiobutton';

const EditServiceModal = ({ service, clubs, isOpen, onClose, onSubmit, onDelete, onStatusChange, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        clubId: null,
        type: '',
        price: null,
        subscriptionLessons: null,
        freezedLesson: null,
        isActive: false,
        isCombo: false,
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && service) {
            setFormData({
                name: service.name,
                clubId: service.clubId,
                type: service.type,
                price: service.price,
                subscriptionLessons: service.subscriptionLessons,
                freezedLesson: service.freezedLesson,
                isActive: service.isActive,
                isCombo: service.isCombo,
            });
        }
    }, [isOpen, service]);

    const handleChange = (field, value) => {
        if (field === 'isActive' || field === 'isCombo') {
            value = value === 'true' || value === true;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.clubId || !formData.type || !formData.price || !formData.subscriptionLessons && formData.subscriptionLessons !== 0 || !formData.freezedLesson && formData.freezedLesson !== 0) {
            toast.error("Заполните все поля");
            return;
        }
        await onSubmit({ ...service, ...formData });
        await onStatusChange(service.id, formData.isActive);
    };

    const handleDelete = async () => {
        await onDelete(service.id);
        setIsDangerModalOpen(false);
        onClose();
    };
    
    const types = [
        { id: "TRIAL", label: getSubscriptionType("TRIAL") },
        { id: "SINGLE", label: getSubscriptionType("SINGLE") },
        { id: "SUBSCRIPTION", label: getSubscriptionType("SUBSCRIPTION") },
        { id: "CAMP", label: getSubscriptionType("CAMP") },
        { id: "AFTERSCHOOL", label: getSubscriptionType("AFTERSCHOOL") },
    ];

    return (
        <>
            <Modal title={'Редактировать услугу'} isOpen={isOpen} onClose={onClose}>
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
                        <Radiobutton
                            label={"Комбо абонемент"}
                            value={formData.isCombo}
                            name={"isCombo"}
                            onChange={(e) => handleChange('isCombo', e.target.value)}
                        />
                        <Input
                            label={"Цена"}
                            id={"price"}
                            value={formData.price || ''}
                            onChange={(e) => handleChange('price', e.target.value)}
                            placeholder={"Цена"}
                            required
                            type="number"
                        />
                        <div className={styles.details}>
                            <Input
                                label={"Количество занятий"}
                                id={"lessons"}
                                value={formData.subscriptionLessons || ''}
                                onChange={(e) => handleChange('subscriptionLessons', e.target.value)}
                                placeholder={"Количество занятий"}
                                required
                                type="number"
                            />
                            <Input
                                label={"Количество заморозок"}
                                id={"freezes"}
                                value={formData.freezedLesson}
                                onChange={(e) => handleChange('freezedLesson', e.target.value)}
                                placeholder={"Количество заморозок"}
                                required
                                type="number"
                            />
                        </div>
                        <Radiobutton
                            label={"Активно"}
                            value={formData.isActive}
                            name={"isActive"}
                            onChange={(e) => handleChange('isActive', e.target.value)}
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

export default EditServiceModal;