import styles from './CreateTeacherModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CreateTeacherModal = ({ isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                email: ''
            });
        }
    }, [isOpen]);

    const handleChange = ((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    });

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
            toast.error('Заполните все поля');
            return;
        }
        await onAdd(formData);
    }

    return (
        <Modal title={'Новый преподаватель'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input
                            label={"Имя"}
                            id={"firstName"}
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            placeholder={"Имя"}
                        />
                        <Input
                            label={"Фамилия"}
                            id={"lastName"}
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            placeholder={"Фамилия"}
                        />
                    </div>
                    <Input
                        label={"Телефон"}
                        id={"phone"}
                        icon={Phone}
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder={"Телефон"}
                    />
                    <Input
                        label={"Почта"}
                        id={"email"}
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder={"Почта"}
                    />
                </div>    
                <Button variant='primary' onClick={handleSubmit}>{loading ? 'Добавление...' : 'Добавить'}</Button>
            </div>
        </Modal>
    );
}

export default CreateTeacherModal;