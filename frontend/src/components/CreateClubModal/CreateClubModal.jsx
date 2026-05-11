import styles from './CreateClubModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Textarea from '../Textarea/Textarea';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Radiobutton from '../Radiobutton/Radiobutton';

const CreateClubModal = ({ categories, teachers, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        classCategoryId: null,
        dayClasses: false,
        defaultTeacherId: null,
        maxStudents: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                description: '',
                classCategoryId: null,
                dayClasses: false,
                defaultTeacherId: null,
                maxStudents: null
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        if (field === 'dayClasses') {
            value = value === 'true' || value === true;
            if (value) setFormData(prev => ({ ...prev, defaultTeacherId: null }));
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.classCategoryId || (!formData.defaultTeacherId && !formData.dayClasses)) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    }

    return (
        <Modal title={'Новый кружок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Input
                        label={"Название"}
                        id={"name"}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={"Название"}
                    />
                    <Textarea
                        label={"Описание"}
                        id={"description"}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder={"Описание"}
                    />
                    <Radiobutton
                        label={"Лагерь/продлёнка"}
                        value={formData.dayClasses}
                        name={"dayClasses"}
                        onChange={(e) => handleChange('dayClasses', e.target.value)}
                    />
                    <div className={styles.details}>
                        <Select
                            label={"Тип занятий"}
                            id={"category"}
                            placeholder={'Выберите'}
                            value={formData.classCategoryId || ''}
                            onChange={(e) => handleChange('classCategoryId', e.target.value)}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name
                            }))}
                            required
                        />
                        <Select
                            label={"Преподаватель"}
                            id={"teacher"}
                            placeholder={'Выберите'}
                            value={formData.defaultTeacherId || ''}
                            onChange={(e) => handleChange('defaultTeacherId', e.target.value)}
                            options={teachers.map((teacher) => ({
                                value: teacher.teacher.id,
                                label: `${teacher.lastName} ${teacher.firstName}`
                            }))}
                            disabled={formData.dayClasses}
                        />
                    </div>
                    <Input
                        label={"Максимальное число участников"}
                        id={"maxStudents"}
                        value={formData.maxStudents || ''}
                        onChange={(e) => handleChange('maxStudents', e.target.value)}
                        placeholder={"Максимальное число участников"}
                        type="number"
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

export default CreateClubModal;