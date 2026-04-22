import styles from './CreateClubCatModal.module.scss';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Textarea from '../Textarea/Textarea';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CreateClubCatModal = ({ isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        descpription: '',
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                descpription: '',
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        if (!formData.name) {
            toast.error("Введите название категории");
            return;
        }
        onAdd(formData);
    }

    return (
        <Modal title={'Новый тип занятий'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input
                        label={"Название"}
                        id={"name"}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Название"
                        required
                    />
                    <Textarea
                        label={"Описание"}
                        id={"description"}
                        value={formData.descpription}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Название"
                    />
                </div>    
                <Button
                    variant='primary'
                    onClick={handleAdd}
                    disabled={loading}
                >
                    {loading ? 'Добавление...' : 'Добавить'}
                </Button>
            </div>
        </Modal>
    );
}

export default CreateClubCatModal;