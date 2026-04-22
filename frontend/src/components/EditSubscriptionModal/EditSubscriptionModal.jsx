import styles from './EditSubscriptionModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import { SUBSCRIPTION_STATUS, getSubscriptionStatus } from '../../utils/helper';
import toast from "react-hot-toast";
import DangerModal from "../DangerModal/DangerModal";
import { useState, useEffect } from "react";

const EditSubscriptionModal = ({ subscription, children, clubs, services, isOpen, onClose, onSubmit, onDelete, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        remainingLessons: null,
        remainingFreezes: null,
    });
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && subscription) {
            setFormData({
                remainingLessons: subscription?.remainingLessons,
                remainingFreezes: subscription?.clubService?.freezedLesson - subscription?.usedFreezes,
            });
        }
    }, [isOpen, subscription]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (formData.remainingFreezes === undefined || formData.remainingLessons === undefined) {
            toast.error("Заполните все обязательные поля");
            return;
        }
        await onSubmit({ ...subscription, remainingLessons: formData.remainingLessons, usedFreezes: subscription.clubService.freezedLesson - formData.remainingFreezes });
    };

    const handleDelete = async () => {
        await onDelete(subscription.id);
        setIsDangerModalOpen(false);
        onClose();
    };

    const handleCancel = async () => {
        await onCancel(subscription.id);
        onClose();
    };

    return (
        <>
            <Modal title={'Редактировать абонемент'} isOpen={isOpen} onClose={onClose}>
                <div className={styles.wrapper}>
                    <div className={styles.inputs}>
                        <Select
                            label={"Ребёнок"}
                            id={"child"}
                            placeholder={'Выберите'}
                            value={formData.childId}
                            onChange={(e) => handleChange('childId', e.target.value)}
                            options={children.map((child) => ({
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }))}
                            disabled
                        />
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
                            disabled
                        />
                        <Select
                            label={"Услуга"}
                            id={"service"}
                            placeholder={'Выберите'}
                            value={formData.clubServiceId}
                            onChange={(e) => handleChange('clubServiceId', e.target.value)}
                            options={services.filter((service) => service.clubId === parseInt(formData.clubId)).map((service) => ({
                                value: service.id,
                                label: service.name
                            }))}
                            disabled
                        />
                        <div className={styles.details}>
                            <Input
                                label={"Осталось занятий"}
                                id={"lessons"}
                                value={formData.remainingLessons}
                                onChange={(e) => handleChange('remainingLessons', e.target.value)}
                                disabled={subscription?.status === 'PENDING' || subscription?.status === 'CANCELLED'}
                            />
                            <Input
                                label={"Осталось заморозок"}
                                id={"freezes"}
                                value={formData.remainingFreezes}
                                onChange={(e) => handleChange('remainingFreezes', e.target.value)}
                                disabled={subscription?.status === 'PENDING' || subscription?.status === 'CANCELLED'}
                            />
                        </div>
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
                            variant='outline'
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            {loading ? 'Отмена абонемента...' : 'Отменить абонемент'}
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

export default EditSubscriptionModal;