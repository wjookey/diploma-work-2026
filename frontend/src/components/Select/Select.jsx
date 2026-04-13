import styles from './Select.module.scss';

const Select = ({ label, id, error, options = [], placeholder, ...props }) => {
    const labelTag = label && id ? <label htmlFor={id} className={styles.label}>{label}</label> : null;
    const defaultPlaceholder = placeholder ? <option value="">{placeholder}</option> : null;
    const optionsItems = options.map((option) => (
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ));
    const errorText = error ? <p className={styles.errorText}>{error}</p> : null;

    return (
        <div className={styles.wrapper}>
            {labelTag}
            <select
                id={id ? id : ''}
                className={`${styles.select} ${error ? styles.error : ''}`}
                {...props}
            >
                {defaultPlaceholder}
                {optionsItems}
            </select>
            {errorText}
        </div>
    );
}

export default Select;