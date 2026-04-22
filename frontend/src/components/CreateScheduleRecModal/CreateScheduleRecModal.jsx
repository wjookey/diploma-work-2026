import styles from './CreateScheduleRecModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { DAYS_OF_WEEK } from '../../utils/helper';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CreateScheduleRecModal = ({ clubs, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState({
        clubId: null,
        dayOfWeek: null,
        startTime: '',
        endTime: '',
        room: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                clubId: null,
                dayOfWeek: null,
                startTime: '',
                endTime: '',
                room: ''
            });
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.clubId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новая запись в расписании'} isOpen={isOpen} onClose={onClose}>
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
                            placeholder={"Время начала"}
                            type="time"
                            required
                        />
                        <Input
                            label={"Время конца"}
                            id={"endTime"}
                            value={formData.endTime || ''}
                            onChange={(e) => handleChange('endTime', e.target.value)}
                            placeholder={"Время конца"}
                            type="time"
                            required
                        />
                    </div>
                    <Input
                        label={"Кабинет"}
                        id={"room"}
                        value={formData.room || ''}
                        onChange={(e) => handleChange(e.target.calue)}
                        placeholder={"Кабинет"}
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

export default CreateScheduleRecModal;