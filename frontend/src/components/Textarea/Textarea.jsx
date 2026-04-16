import styles from './Textarea.module.scss'

const Textarea = ({ label, id, error, ...props }) => {
    const labelTag = label && id ? <label htmlFor={id} className={styles.label}>{label}</label> : null;
    const errorText = error ? <p className={styles.errorText}>{error}</p> : null;

    return (
        <div className={styles.wrapper}>
            {labelTag}
                <div className={styles.inputField}>
                    <textarea
                        id={id ? id : ''}
                        className={`${styles.input} ${error ? styles.error : ''}`}
                        {...props}
                    />
                </div>
            {errorText}
        </div>
    );
};

export default Textarea;