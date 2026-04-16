import styles from './Card.module.scss';

const Card = ({ children, isInModal = false, ...props }) => {
    return (
        <div className={`${styles.card} ${isInModal ? styles.modal : ''}`} {...props}>
            {children}
        </div>
    );
}

export default Card;