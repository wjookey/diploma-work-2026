import styles from './CreateComboModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CreateComboModal = ({ children, clubs, services, isOpen, onClose, onAdd, loading = false }) => {
    const [formData, setFormData] = useState([
        { childId: null, clubId: null, clubServiceId: null },
        { childId: null, clubId: null, clubServiceId: null },
    ]);

    useEffect(() => {
        if (!isOpen) {
            setFormData([
                { childId: null, clubId: null, clubServiceId: null },
                { childId: null, clubId: null, clubServiceId: null },
            ]);
        }
    }, [isOpen]);

    const handleChange = (index, field, value) => {
        const newData = [...formData];
        newData[index][field] = value;
        setFormData(newData);
    };

    const handleSubmit = async () => {
        if (!formData[0].childId || !formData[0].clubId || !formData[0].clubServiceId || !formData[1].childId || !formData[1].clubId || !formData[1].clubServiceId) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        await onAdd(formData);
    };

    return (
        <Modal title={'Новый абонемент'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <h3 className={styles.header}>1-й комбо абонемент</h3>
                <div className={styles.inputs}>
                    <Select
                        label={"Ребёнок"}
                        id={"child"}
                        placeholder={'Выберите'}
                        value={formData[0].childId || ''}
                        onChange={(e) => handleChange(0, 'childId', e.target.value)}
                        options={children.map((child) => ({
                            value: child.id,
                            label: `${child.lastName} ${child.firstName}`
                        }))}
                        required
                    />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        value={formData[0].clubId || ''}
                        onChange={(e) => handleChange(0, 'clubId', e.target.value)}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        required
                    />
                    <Select
                        label={"Услуга"}
                        id={"service"}
                        placeholder={'Выберите'}
                        value={formData[0].clubServiceId || ''}
                        onChange={(e) => handleChange(0, 'clubServiceId', e.target.value)}
                        options={services.filter((service) => service.clubId === parseInt(formData[0].clubId)).map((service) => ({
                            value: service.id,
                            label: service.name
                        }))}
                        required
                    />
                </div>   
                <h3 className={styles.header}>2-й комбо абонемент</h3>
                <div className={styles.inputs}>
                    <Select
                        label={"Ребёнок"}
                        id={"child"}
                        placeholder={'Выберите'}
                        value={formData[1].childId || ''}
                        onChange={(e) => handleChange(1, 'childId', e.target.value)}
                        options={children.map((child) => ({
                            value: child.id,
                            label: `${child.lastName} ${child.firstName}`
                        }))}
                        required
                    />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        value={formData[1].clubId || ''}
                        onChange={(e) => handleChange(1, 'clubId', e.target.value)}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                        required
                    />
                    <Select
                        label={"Услуга"}
                        id={"service"}
                        placeholder={'Выберите'}
                        value={formData[1].clubServiceId || ''}
                        onChange={(e) => handleChange(1, 'clubServiceId', e.target.value)}
                        options={services.filter((service) => service.clubId === parseInt(formData[1].clubId)).map((service) => ({
                            value: service.id,
                            label: service.name
                        }))}
                        required
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

export default CreateComboModal;