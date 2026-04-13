import styles from './SidebarFooter.module.scss';
import { LogOut } from 'lucide-react';

const SidebarFooter = ({onClick, name, email}) => {
    return (
        <div className={styles.footer}>
            <div className={styles.profileInfo}>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.email}>{email}</p>
            </div>
            <button className={styles.button} onClick={onClick}>
                <LogOut className={styles.icon} />
                Выйти
            </button>
        </div>

    );
}

export default SidebarFooter;