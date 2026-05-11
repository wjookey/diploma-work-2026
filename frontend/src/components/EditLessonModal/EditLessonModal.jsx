import styles from './EditLessonModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { LESSON_STATUS, getLessonStatus, formatDate } from '../../utils/helper';
import toast from "react-hot-toast";
import DangerModal from "../DangerModal/DangerModal";
import { useState, useEffect } from "react";

const EditLessonModal = ({ lesson, clubs, teachers, isOpen, onClose, onSubmit, onDelete, onStatusChange, loading = false }) => {
    const [formData, setFormData] = useState({
        clubId: null,
        date: '',
        startTime: '',
        endTime: '',
        assignedTeacherId: null,
        room: '',
        topic: '',
        status: '',
        dayClasses: false,
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        const date = lesson?.date.split("T")[0];
        if (isOpen && lesson) {
            setFormData({
                clubId: lesson.clubId,
                date: date,
                startTime: lesson.startTime,
                endTime: lesson.endTime,
                assignedTeacherId: lesson.assignedTeacherId,
                room: lesson.room,
                topic: lesson.topic,
                status: lesson.status,
                dayClasses: lesson.club.dayClasses
            });
        }
    }, [isOpen, lesson]);

    const handleChange = (field, value) => {
        if (field === 'clubId') {
            const club = clubs.find((club) => club.id === parseInt(value));
            setFormData(prev => ({ ...prev, assignedTeacherId: club.defaultTeacherId, dayClasses: club.dayClasses }));
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.clubId || !formData.date || !formData.startTime || !formData.endTime) {
            toast.error("Заполните все обязательные поля");
            return;
        }
        await onSubmit({ ...lesson, ...formData });
        await onStatusChange(lesson.id, formData.status);
    };

    const handleDelete = async () => {
        await onDelete(lesson.id);
        setIsDangerModalOpen(false);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать урок'} isOpen={isOpen} onClose={onClose}>
                <div className={styles.wrapper}>
                    <div className={styles.inputs}>
                        <Select
                            label={"Кружок"}
                            id={"club"}
                            placeholder={'Выберите'}
                            value={formData.clubId}
                            onChange={(e) => handleChange('clubId', e.target.value)}
                            options={clubs.map((club) => ({
                                value: club.id,
                                label: club.name
                            }))}
                            required
                            disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
                        />
                        <Input
                            label={"Дата"}
                            id={"date"}
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            placeholder={"Дата"}
                            type="date"
                            required
                            disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
                        />
                        <div className={styles.details}>
                            <Input
                                label={"Время начала"}
                                id={"startTime"}
                                value={formData.startTime}
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                type="time"
                                required
                                disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
                            />
                            <Input
                                label={"Время конца"}
                                id={"endTime"}
                                value={formData.endTime}
                                onChange={(e) => handleChange('endTime', e.target.value)}
                                type="time"
                                required
                                disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
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
                            disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED' || formData.dayClasses}
                        />
                        <Input
                            label={"Кабинет"}
                            id={"room"}
                            value={formData.room || ''}
                            onChange={(e) => handleChange('room', e.target.value)}
                            disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
                        />
                        <Input
                            label={"Тема занятия"}
                            id={"topic"}
                            value={formData.topic || ''}
                            onChange={(e) => handleChange('topic', e.target.value)}
                            disabled={lesson?.status === 'COMPLETED' || lesson?.status === 'CANCELLED'}
                        />
                        <Select
                            label={"Статус"}
                            id={"status"}
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            options={LESSON_STATUS.filter((lessonSt) => lessonSt.value !== 'COMPLETED').map((lessonSt) => ({
                                value: lessonSt.value,
                                label: lessonSt.label
                            }))}
                            disabled={lesson?.status === 'COMPLETED'}
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

export default EditLessonModal;