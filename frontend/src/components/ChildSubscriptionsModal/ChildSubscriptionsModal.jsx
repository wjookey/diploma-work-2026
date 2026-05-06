import styles from './ChildSubscriptionsModal.module.scss';
import Modal from '../Modal/Modal';
import ChildSubscriptionCard from '../ChildSubscriptionCard/ChildSubscriptionCard';

const ChildSubscriptionsModal = ({ subscriptions, isOpen, onClose }) => {
    const subscriptionsItems = subscriptions?.filter((sub) => sub.status === 'ACTIVE').map((sub) => (
        <ChildSubscriptionCard subDetails={sub} key={sub.id} />
    ));

    return (
        <Modal title={"Абонементы"} isOpen={isOpen} onClose={onClose} >
            {subscriptionsItems.length > 0 ? (
                <div className={styles.subscriptions}>
                    {subscriptionsItems}
                </div>
            ) : (
                <div className={styles.text}>
                    Нет активных абонементов  
                </div>
            )}
            
        </Modal>
    );
}

export default ChildSubscriptionsModal;