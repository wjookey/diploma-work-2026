import styles from './CreateSubscriptionModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';

const CreateSubscriptionModal = ({ children, clubs, services, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый абонемент'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <Select
                        label={"Ребёнок"}
                        id={"child"}
                        placeholder={'Выберите'}
                        options={children.map((child) => ({
                            value: child.id,
                            label: `${child.lastName} ${child.firstName}`
                        }))}
                    />
                    <Select
                        label={"Кружок"}
                        id={"club"}
                        placeholder={'Выберите'}
                        options={clubs.map((club) => ({
                            value: club.id,
                            label: club.name
                        }))}
                    />
                    <Select
                        label={"Услуга"}
                        id={"service"}
                        placeholder={'Выберите'}
                        options={services.map((service) => ({
                            value: service.id,
                            label: service.name
                        }))}
                    />
                </div>   
                <Button variant='primary' onClick={onAdd}>Добавить</Button>
            </div>
        </Modal>
    );
}

export default CreateSubscriptionModal;