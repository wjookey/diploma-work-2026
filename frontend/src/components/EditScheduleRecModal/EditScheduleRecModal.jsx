import styles from './EditScheduleRecModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { DAYS_OF_WEEK, getDayName } from '../../utils/helper';
import toast from "react-hot-toast";
import DangerModal from "../DangerModal/DangerModal";
import { useState, useEffect } from "react";

const EditScheduleRecModal = ({ record, clubs, isOpen, onClose, onSubmit, onDelete, loading = false }) => {
    const [formData, setFormData] = useState({
        clubId: null,
        dayOfWeek: null,
        startTime: '',
        endTime: '',
        room: ''
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && record) {
            setFormData({
                clubId: record.clubId,
                dayOfWeek: record.dayOfWeek,
                startTime: record.startTime,
                endTime: record.endTime,
                room: record.room
            });
        }
    }, [isOpen, record]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.clubId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onSubmit({ ...record, ...formData });
    };

    const handleDelete = async () => {
        await onDelete(record.id);
        setIsDangerModalOpen(false);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать запись в расписании'} isOpen={isOpen} onClose={onClose}>
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
                        <Select
                            label={"День недели"}
                            id={"dayOfWeek"}
                            placeholder={'Выберите'}
                            value={formData.dayOfWeek || ''}
                            onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                            options={DAYS_OF_WEEK.map((day) => ({
                                value: day.value,
                                label: day.label
                            }))}
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
                        <Input
                            label={"Кабинет"}
                            id={"room"}
                            value={formData.room || ''}
                            onChange={(e) => handleChange(e.target.calue)}
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

export default EditScheduleRecModal;