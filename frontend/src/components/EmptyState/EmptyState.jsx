import styles from './EmptyState.module.scss';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
    const descriptionBlock = description ? <p className={styles.description}>{description}</p> : null;
    return (
        <div className={styles.wrapper}>
            <div className={styles.iconBlock}>
                <Icon className={styles.icon} />
            </div>
            <h3 className={styles.text}>{title}</h3>
            {descriptionBlock}
            <div className={styles.button}>{action}</div>
        </div>
    );
}

export default EmptyState;