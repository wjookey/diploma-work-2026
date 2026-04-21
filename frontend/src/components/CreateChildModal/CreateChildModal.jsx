import styles from './CreateChildModal.module.scss';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CreateChildModal = ({ isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({ firstName: '', lastName: '', birthDate: '' });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName) {
            toast.error("Заполните все поля");
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новый ребёнок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.name}>
                        <Input 
                            label={"Имя"} 
                            id={"firstName"}
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            placeholder="Имя"
                        />
                        <Input 
                            label={"Фамилия"} 
                            id={"lastName"}
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            placeholder="Фамилия"
                        />
                    </div>
                    <Input 
                        label={"Дата рождения"} 
                        id={"birthDate"} 
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
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

export default CreateChildModal;