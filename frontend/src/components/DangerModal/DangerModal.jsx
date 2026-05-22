import styles from './DangerModal.module.scss';
import Button from '../Button/Button';
import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';

const DangerModal = ({ onDelete, isOpen, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;
        lockBodyScroll();
        return () => unlockBodyScroll();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.darkBackground} onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Вы уверены, что хотите удалить?</h2>
                    <p className={styles.subtitle}>Восстановить удалённые данные не получится.</p>
                </div>

                <div className={styles.buttons}>
                    <Button variant='danger' onClick={onDelete}>Удалить</Button>
                    <Button variant='primary' onClick={onClose}>Отмена</Button>
                </div>
            </div>
        </div>
    );
}

export default DangerModal;