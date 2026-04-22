import styles from './CreateSubscriptionModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CreateSubscriptionModal = ({ children, clubs, services, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        childId: null,
        clubId: null,
        clubServiceId: null,
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                childId: null,
                clubId: null,
                clubServiceId: null,
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.childId || !formData.clubId || !formData.clubServiceId) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новый абонемент'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Ребёнок"}
                        id={"child"}
                        placeholder={'Выберите'}
                        value={formData.childId || ''}
                        onChange={(e) => handleChange('childId', e.target.value)}
                        options={children.map((child) => ({
                            value: child.id,
                            label: `${child.lastName} ${child.firstName}`
                        }))}
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
                        label={"Услуга"}
                        id={"service"}
                        placeholder={'Выберите'}
                        value={formData.clubServiceId || ''}
                        onChange={(e) => handleChange('clubServiceId', e.target.value)}
                        options={services.filter((service) => service.clubId === parseInt(formData.clubId)).map((service) => ({
                            value: service.id,
                            label: service.name
                        }))}
                        required
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

export default CreateSubscriptionModal;