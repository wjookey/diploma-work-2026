import styles from './EditChildModal.module.scss';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { useState, useEffect } from 'react';
import DangerModal from '../DangerModal/DangerModal';
import toast from 'react-hot-toast';

const EditChildModal = ({ child, onSubmit, onDelete, isOpen, onClose, loading = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: ''
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && child) {
            const birthDate = child.birthDate ? child.birthDate.split('T')[0] : '';
            setFormData({
                firstName: child.firstName || '',
                lastName: child.lastName || '',
                birthDate: birthDate
            });
        }
    }, [isOpen, child]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName) {
            toast.error("Заполните все поля");
            return;
        }
        await onSubmit({ ...child, ...formData });
    };

    const handleDeleteChild = async () => {
        await onDelete(child.id);
        setIsDangerModalOpen(false);
        onClose();
    }

    return (
        <>
            <Modal title={'Редактировать ребёнка'} isOpen={isOpen} onClose={onClose}>
                <div className={styles.wrapper}>
                    <div className={styles.inputs}>
                        <div className={styles.name}>
                            <Input 
                                label={"Имя"} 
                                id={"firstName"} 
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                            />
                            <Input 
                                label={"Фамилия"} 
                                id={"lastName"} 
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />
                        </div>
                        <Input 
                            label={"Дата рождения"} 
                            id={"birthDate"} 
                            value={formData.birthDate}
                            type="date"
                            onChange={(e) => handleChange('birthDate', e.target.value)}
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
                            Удалить ребёнка
                        </Button>
                    </div>
                </div>
            </Modal>
            <DangerModal
                isOpen={isDangerModalOpen}
                onClose={() => setIsDangerModalOpen(false)}
                onDelete={handleDeleteChild}
            />
        </>
    );
}

export default EditChildModal;