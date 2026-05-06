import styles from './EditClubModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Textarea from '../Textarea/Textarea';
import toast from 'react-hot-toast';
import DangerModal from '../DangerModal/DangerModal';
import { useState, useEffect } from 'react';
 
const EditClubModal = ({ club, categories, teachers, isOpen, onClose, onStatusChange, onSubmit, onDelete, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        classCategoryId: null,
        defaultTeacherId: null,
        maxStudents: null,
        isActive: false,
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && club) {
            setFormData({
                name: club.name,
                description: club.description,
                classCategoryId: club.classCategoryId,
                defaultTeacherId: club.defaultTeacherId,
                maxStudents: club.maxStudents,
                isActive: club.isActive,
            });
        }
    }, [isOpen, club]);

    const handleChange = (field, value) => {
        if (field === 'isActive') {
            value = value === 'true' || value === true;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Введите название кружка");
            return;
        }
        await onSubmit({ ...club, ...formData });
        await onStatusChange(club.id, formData.isActive);
    };

    const handleDelete = async () => {
        await onDelete(club.id);
        setIsDangerModalOpen(false);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать кружок'} isOpen={isOpen} onClose={onClose}>
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
                        <div className={styles.details}>
                            <Select
                                label={"Тип занятий"}
                                id={"category"}
                                placeholder={"Выберите"}
                                value={formData.classCategoryId}
                                onChange={(e) => handleChange('classCategoryId', e.target.value)}
                                options={categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.name
                                }))}
                            />
                            <Select
                                label={"Преподаватель"}
                                id={"teacher"}
                                placeholder={"Выберите"}
                                value={formData.defaultTeacherId}
                                onChange={(e) => handleChange('defaultTeacherId', e.target.value)}
                                options={teachers.map((teacher) => ({
                                    value: teacher.teacher.id,
                                    label: `${teacher.lastName} ${teacher.firstName}`
                                }))}
                            />
                        </div>
                        <Input
                            label={"Максимальное число участников"}
                            id={"maxStudents"}
                            value={formData.maxStudents}
                            onChange={(e) => handleChange('maxStudents', e.target.value)}
                            type="number"
                        />
                        <Select
                            label={"Статус"}
                            id={"status"}
                            placeholder={"Выберите"}
                            value={formData.isActive}
                            onChange={(e) => handleChange('isActive', e.target.value)}
                            options={[
                                { value: false, label: "Не активный" },
                                { value: true, label: "Активный" },
                            ]}
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

export default EditClubModal;