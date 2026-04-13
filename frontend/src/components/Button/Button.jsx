import styles from './Button.module.scss';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = "primary", size = "md", icon: Icon, loading = false, disabled = false, ...props }) => {
    const loader = loading ? <Loader2 className={styles.loadingIcon} /> : Icon ? <Icon className={styles.icon} /> : null;
    
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${Icon ? styles.withIcon : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loader}
            {children}
        </button>
    );
}

export default Button;