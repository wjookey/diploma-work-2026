import styles from './Tag.module.scss';

const Tag = ({ text = 'Active', color = 'purple' }) => {
    return (
        <div className={`${styles.tag} ${styles[color]}`}>
            {text}
        </div>
    );
}

export default Tag;