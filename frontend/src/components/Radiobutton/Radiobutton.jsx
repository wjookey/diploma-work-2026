import styles from './Radiobutton.module.scss';

const Radiobutton = ({ label, name, value, onChange }) => {
    return (
        <div className={styles.radioGroup}>
            <label className={styles.label}>{label}</label>
            <div className={styles.radioOptions}>
                <label className={styles.radioOption}>
                    <input
                        type="radio"
                        name={name}
                        value="true"
                        checked={value === true}
                        onChange={onChange}
                    />
                    <span>Да</span>
                </label>
                <label className={styles.radioOption}>
                    <input
                        type="radio"
                        name={name}
                        value="false"
                        checked={value === false}
                        onChange={onChange}
                    />
                    <span>Нет</span>
                </label>
            </div>
        </div>
    );
}

export default Radiobutton;