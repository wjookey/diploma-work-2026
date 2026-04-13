import styles from './Loader.module.scss';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Загрузка" }) => {
    return (
        <div className={styles.wrapper}>
            <Loader2 className={styles.icon} />
            <p className={styles.text}>{text}</p>
        </div>
    );
}

export default Loader;