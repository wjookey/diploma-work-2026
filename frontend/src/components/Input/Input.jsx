import styles from './Input.module.scss'

const Input = ({ label, id, error, icon: Icon, ...props }) => {
    const labelTag = label && id ? <label htmlFor={id} className={styles.label}>{label}</label> : null;
    const icon = Icon ? <div className={styles.iconBlock}><Icon className={styles.icon} /></div> : null;
    const errorText = error ? <p className={styles.errorText}>{error}</p> : null;

    return (
        <div className={styles.wrapper}>
            {labelTag}
                <div className={styles.inputField}>
                    {icon}
                    <input
                        id={id ? id : ''}
                        className={`${styles.input} ${Icon ? styles.withIcon : ''} ${error ? styles.error : ''}`}
                        {...props}
                    />
                </div>
            {errorText}
        </div>
    );
};

export default Input;