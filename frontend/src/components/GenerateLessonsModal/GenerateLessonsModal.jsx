import styles from './GenerateLessonsModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const GenerateLessonsModal = ({ isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                startDate: '',
                endDate: ''
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.startDate || !formData.endDate) {
            toast.error('Заполните все поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новая запись в расписании'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.details}>
                        <Input
                            label={"Дата начала"}
                            id={"startDate"}
                            value={formData.startDate || ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            type="date"
                            required
                        />
                        <Input
                            label={"Дата конца"}
                            id={"endDate"}
                            value={formData.endDate || ''}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            type="date"
                            required
                        />
                    </div>
                </div>   
                <Button
                    variant='primary'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Добавление..." : "Добавить"}
                </Button>
            </div>
        </Modal>
    );
}

export default GenerateLessonsModal;