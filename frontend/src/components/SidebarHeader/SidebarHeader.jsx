import styles from './SidebarHeader.module.scss';
import { X } from 'lucide-react';

const SidebarHeader = ({ onClose }) => {
    return (
        <div className={styles.header}>
            <div className={styles.companyInfo}>
                <img
                    className={styles.logo}
                    src="logo.svg"
                />
                <h2 className={styles.title}>Пристань авантюристов</h2>
            </div>
            <button onClick={onClose} className={styles.button}>
                <X className={styles.icon} />
            </button>
      </div>
    );
}

export default SidebarHeader;