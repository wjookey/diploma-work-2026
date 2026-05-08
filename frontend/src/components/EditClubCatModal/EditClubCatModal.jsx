import styles from './EditClubCatModal.module.scss';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Textarea from '../Textarea/Textarea';
import DangerModal from '../DangerModal/DangerModal';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Radiobutton from '../Radiobutton/Radiobutton';

const EditClubCatModal = ({ category, onSubmit, onDelete, isOpen, onClose, onStatusChange, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: false,
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && category) {
            setFormData({
                name: category.name,
                description: category.description,
                isActive: category.isActive,
            });
        }
    }, [isOpen, category]);

    const handleChange = (field, value) => {
        if (field === 'isActive') {
            value = value === 'true' || value === true;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Введите название категории');
            return;
        }
        await onSubmit({ ...category, ...formData });
        await onStatusChange(category.id, formData.isActive);
    };

    const handleDelete = async () => {
        await onDelete(category.id);
        setIsDangerModalOpen(false);
        onClose();
    }

    return (
        <>
            <Modal title={'Редактировать тип занятий'} isOpen={isOpen} onClose={onClose}>
                <div className={styles.wrapper}>
                    <div className={styles.inputs}>
                        <Input
                            label={"Название"}
                            id={"name"}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                        <Textarea
                            label={"Описание"}
                            id={"description"}
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
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

export default EditClubCatModal;