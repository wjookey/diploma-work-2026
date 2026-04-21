import styles from './EditParentModal.module.scss';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import DangerModal from '../DangerModal/DangerModal';
import toast from 'react-hot-toast';

const EditParentModal = ({ parent, onSubmit, onDelete, isOpen, onClose, loading = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && parent?.user) {
            setFormData({
                firstName: parent.user.firstName || '',
                lastName: parent.user.lastName || '',
                phone: parent.user.phone || '',
                email: parent.user.email || ''
            });
        }
    }, [isOpen, parent]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            toast.error("Заполните все поля");
            return;
        }
        await onSubmit({ ...parent, user: { ...parent.user, ...formData } });
    };

    const handleDeleteParent = async () => {
        await onDelete(parent?.userId);
        setIsDangerModalOpen(false);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать родителя'} isOpen={isOpen} onClose={onClose}>
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
                            label={"Телефон"} 
                            id={"phone"} 
                            icon={Phone} 
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        <Input 
                            label={"Почта"} 
                            id={"email"} 
                            icon={Mail} 
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
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
                            Удалить родителя
                        </Button>
                    </div>
                </div>
            </Modal>
            <DangerModal
                isOpen={isDangerModalOpen}
                onClose={() => setIsDangerModalOpen(false)}
                onDelete={handleDeleteParent}
            />
        </>
    );
}

export default EditParentModal;