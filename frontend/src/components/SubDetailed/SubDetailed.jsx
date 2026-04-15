import styles from './SubDetailed.module.scss';
import ClubServiceCard from '../ClubServiceCard/ClubServiceCard';
import ChildSubscriptionCard from '../ChildSubscriptionCard/ChildSubscriptionCard';
import PaymentCard from '../PaymentCard/PaymentCard';
import Modal from '../Modal/Modal';

const SubDetailed = ({ subscription, service, payment, isOpen, onClose }) => {
    return (
        <Modal title={`${subscription.child.lastName} ${subscription.child.firstName}`} isOpen={isOpen} onClose={onClose}>
            <div className={styles.content}>
                <div className={styles.service}>
                    <h3 className={styles.header}>Услуга</h3>
                    <ClubServiceCard clubService={service} isEditMode={false} />
                </div>
                <div className={styles.subscription}>
                    <h3 className={styles.header}>Абонемент</h3>
                    <ChildSubscriptionCard subDetails={subscription} />
                </div>
                <div className={styles.payment}>
                    <h3 className={styles.header}>Оплата</h3>
                    <PaymentCard payment={payment} isEditMode={false} />
                </div>
            </div>
        </Modal>
    );
}

export default SubDetailed;