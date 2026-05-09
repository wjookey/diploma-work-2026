import styles from './SidebarFooter.module.scss';
import { LogOut, Pen } from 'lucide-react';
import Button from '../Button/Button';

const SidebarFooter = ({onClick, name, email, onEdit}) => {
    return (
        <div className={styles.footer}>
            <div className={styles.profileInfo}>
                <div className={styles.data}>
                    <h3 className={styles.name}>{name}</h3>
                    <p className={styles.email}>{email}</p>
                </div>
                <div className={styles.editButton}><Button variant='transparent' icon={Pen} onClick={onEdit} /></div>
            </div>
            <button className={styles.button} onClick={onClick}>
                <LogOut className={styles.icon} />
                Выйти
            </button>
        </div>

    );
}

export default SidebarFooter;