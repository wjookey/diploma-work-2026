import styles from './CreateFamilyModal.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Phone, Mail, Plus, X } from 'lucide-react';
import Modal from '../Modal/Modal';
import ParentCard from '../ParentCard/ParentCard';
import ChildCard from '../ChildCard/ChildCard';

const CreateFamilyModal = ({ 
    isOpen, 
    onClose, 
    familyName, 
    onFamilyNameChange,
    parentForm,
    onParentFormChange,
    parents,
    onParentAdd,
    onParentRemove,
    childForm,
    onChildFormChange,
    children,
    onChildAdd,
    onChildRemove,
    onSubmit,
    loading = false
}) => {
    const parentsItems = parents.map((parent, index) => (
        <div key={index} style={{ position: 'relative' }}>
            <ParentCard
                name={`${parent.lastName} ${parent.firstName}`}
                email={parent.email}
                phone={parent.phone}
                isEditMode={false}
            />
            <button 
                onClick={() => onParentRemove(index)}
                style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                }}
            >
                <X size={20} color="red" />
            </button>
        </div>
    ));

    const childrenItems = children.map((child, index) => (
        <div key={index} style={{ position: 'relative' }}>
            <ChildCard
                name={`${child.lastName} ${child.firstName}`}
                birthDate={child.birthDate}
                isEditMode={false}
                isWatchDetailed={false}
            />
            <button 
                onClick={() => onChildRemove(index)}
                style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                }}
            >
                <X size={20} color="red" />
            </button>
        </div>
    ));

    return (
        <Modal title={"Новая семья"} isOpen={isOpen} onClose={onClose}>
            <div className={styles.wrapper}>
                <Input 
                    label={'Имя семьи'} 
                    id={'famName'} 
                    value={familyName}
                    onChange={(e) => onFamilyNameChange(e.target.value)}
                    placeholder="Введите фамилию семьи"
                />
                
                <div className={styles.parentsBlock}>
                    <h3 className={styles.header}>Родители</h3>
                    <div className={styles.inputs}>
                        <div className={styles.name}>
                            <Input 
                                label={"Имя"} 
                                id={"firstNameP"} 
                                value={parentForm.firstName}
                                onChange={(e) => onParentFormChange('firstName', e.target.value)}
                                placeholder="Имя"
                            />
                            <Input 
                                label={"Фамилия"} 
                                id={"lastNameP"} 
                                value={parentForm.lastName}
                                onChange={(e) => onParentFormChange('lastName', e.target.value)}
                                placeholder="Фамилия"
                            />
                        </div>
                        <Input 
                            label={"Телефон"} 
                            id={"phone"} 
                            icon={Phone}
                            value={parentForm.phone}
                            onChange={(e) => onParentFormChange('phone', e.target.value)}
                            placeholder="Телефон"
                        />
                        <Input 
                            label={"Почта"} 
                            id={"email"} 
                            icon={Mail}
                            value={parentForm.email}
                            onChange={(e) => onParentFormChange('email', e.target.value)}
                            placeholder="Почта"
                        />
                    </div>
                    <Button 
                        variant='outline' 
                        onClick={onParentAdd} 
                        icon={Plus}
                        disabled={loading}
                    >
                        Добавить родителя
                    </Button>
                    <div className={styles.parents}>
                        {parentsItems}
                    </div>
                </div>

                <div className={styles.childrenBlock}>
                    <h3 className={styles.header}>Дети</h3>
                    <div className={styles.inputs}>
                        <div className={styles.name}>
                            <Input 
                                label={"Имя"} 
                                id={"firstNameC"} 
                                value={childForm.firstName}
                                onChange={(e) => onChildFormChange('firstName', e.target.value)}
                                placeholder="Имя"
                            />
                            <Input 
                                label={"Фамилия"} 
                                id={"lastNameC"} 
                                value={childForm.lastName}
                                onChange={(e) => onChildFormChange('lastName', e.target.value)}
                                placeholder="Фамилия"
                            />
                        </div>
                        <Input 
                            label={"Дата рождения"} 
                            id={"birthDate"} 
                            type="date"
                            value={childForm.birthDate}
                            onChange={(e) => onChildFormChange('birthDate', e.target.value)}
                        />
                    </div>
                    <Button 
                        variant='outline' 
                        onClick={onChildAdd} 
                        icon={Plus}
                        disabled={loading}
                    >
                        Добавить ребенка
                    </Button>
                    <div className={styles.children}>
                        {childrenItems}
                    </div>
                </div>

                <Button 
                    variant='primary' 
                    onClick={onSubmit}
                    disabled={loading}
                >
                    {loading ? 'Создание...' : 'Добавить'}
                </Button>
            </div>
        </Modal>
    );
}

export default CreateFamilyModal;