import styles from './Modal.module.scss';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (!isOpen) return;
        lockBodyScroll();
        return () => unlockBodyScroll();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.darkBackground} onClick={onClose} />
            <div className={`${styles.modal} ${styles[size]}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button onClick={onClose} className={styles.button}>
                        <X className={styles.icon}/>
                    </button>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;