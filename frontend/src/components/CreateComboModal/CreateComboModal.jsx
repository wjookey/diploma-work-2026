import styles from './CreateComboModal.module.scss';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select from '../Select/Select';

const CreateComboModal = ({ children, clubs, services, isOpen, onClose, onAdd }) => {
    return (
        <Modal title={'Новый абонемент'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <h3 className={styles.header}>1-й комбо абонемент</h3>
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
                <h3 className={styles.header}>2-й комбо абонемент</h3>
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

export default CreateComboModal;