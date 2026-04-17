import styles from './ChildSubscriptionsModal.module.scss';
import Modal from '../Modal/Modal';
import ChildSubscriptionCard from '../ChildSubscriptionCard/ChildSubscriptionCard';

const ChildSubscriptionsModal = ({ subscriptions, isOpen, onClose }) => {
    const subscriptionsItems = subscriptions?.map((sub) => (
        <ChildSubscriptionCard subDetails={sub} key={sub.id} />
    ));

    return (
        <Modal title={"Абонементы"} isOpen={isOpen} onClose={onClose} >
            <div className={styles.subscriptions}>
                {subscriptionsItems}
            </div>
        </Modal>
    );
}

export default ChildSubscriptionsModal;