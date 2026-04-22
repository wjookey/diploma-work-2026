import styles from './CreateLessonModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CreateLessonModal = ({ clubs, teachers, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        clubId: null,
        date: '',
        startTime: '',
        endTime: '',
        assignedTeacherId: null,
        room: '',
        topic: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                clubId: null,
                date: '',
                startTime: '',
                endTime: '',
                assignedTeacherId: null,
                room: '',
                topic: ''
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.clubId || !formData.date || !formData.startTime || !formData.endTime) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новый урок'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        value={formData.clubId || ''}
                        onChange={(e) => handleChange('clubId', e.target.value)}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        required
                    />
                    <Input
                        label={"Дата"}
                        id={"date"}
                        value={formData.date || ''}
                        onChange={(e) => handleChange('date', e.target.value)}
                        placeholder={"Дата"}
                        type="date"
                        required
                    />
                    <div className={styles.details}>
                        <Input
                            label={"Время начала"}
                            id={"startTime"}
                            value={formData.startTime || ''}
                            onChange={(e) => handleChange('startTime', e.target.value)}
                            type="time"
                            required
                        />
                        <Input
                            label={"Время конца"}
                            id={"endTime"}
                            value={formData.endTime || ''}
                            onChange={(e) => handleChange('endTime', e.target.value)}
                            type="time"
                            required
                        />
                    </div>
                    <Select
                        label={"Учитель"}
                        id={"teacher"}
                        placeholder={'Выберите'}
                        value={formData.assignedTeacherId || ''}
                        onChange={(e) => handleChange('assignedTeacherId', e.target.value)}
                        options={teachers.map((teacher) => ({
                            value: teacher.teacher.id,
                            label: `${teacher.lastName} ${teacher.firstName}`
                        }))}
                    />
                    <Input
                        label={"Кабинет"}
                        id={"room"}
                        value={formData.room || ''}
                        onChange={(e) => handleChange('room', e.target.value)}
                        placeholder={"Кабинет"}
                    />
                    <Input
                        label={"Тема занятия"}
                        id={"topic"}
                        value={formData.topic || ''}
                        onChange={(e) => handleChange('topic', e.target.value)}
                        placeholder={"Тема занятия"}
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

export default CreateLessonModal;