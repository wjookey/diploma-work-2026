import styles from './EditTeacherModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Phone } from 'lucide-react';
import DangerModal from '../DangerModal/DangerModal';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const EditTeacherModal = ({ user, onSubmit, onDelete, isOpen, onClose, loading = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                email: user.email || '',
            });
        }
    }, [isOpen, user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
            toast.error('Заполните все поля');
            return;
        }
        await onSubmit({...user, ...formData});
    };

    const handleDelete = async () => {
        await onDelete(user.id);
        setIsDangerModalOpen(false);
        onClose();
    }

    return (
        <>
            <Modal title={'Редактировать преподавателя'} isOpen={isOpen} onClose={onClose}>
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
                            Удалить преподавателя
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

export default EditTeacherModal;