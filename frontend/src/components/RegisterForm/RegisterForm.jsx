import styles from './RegisterForm.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Lock, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const RegisterForm = ({ loading, onSubmit, onCodeRequest }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        familyName: '',
        code: '',
    });

    useEffect(() => {
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            familyName: '',
            code: '',
        });
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRequestCode = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.familyName) {
            toast.error('Заполните все поля');
            return;
        }
        await onCodeRequest(formData);
    };

    const handleVerifyCode = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.familyName) {
            toast.error('Заполните все поля');
            return;
        }
        await onSubmit(formData);
    };
    
    return (
        <div className={styles.layout}>
            <div className={styles.textBlock}>
                <h2 className={styles.title}>Регистрация</h2>
                <p className={styles.description}>
                    Введите ваши данные
                </p>
            </div>
            <div className={styles.formBlock}>
                <div className={styles.inputsBlock}>
                    <div className={styles.name}>
                        <Input 
                            label={"Имя"} 
                            id={"firstName"} 
                            value={formData.firstName}
                            placeholder="Имя"
                            onChange={(e) => handleChange('firstName', e.target.value)}
                        />
                        <Input 
                            label={"Фамилия"} 
                            id={"lastName"} 
                            value={formData.lastName}
                            placeholder="Фамилия"
                            onChange={(e) => handleChange('lastName', e.target.value)}
                        />
                    </div>
                    <Input 
                        label={"Телефон"} 
                        id={"phone"} 
                        icon={Phone} 
                        value={formData.phone}
                        placeholder="Телефон"
                        onChange={(e) => handleChange('phone', e.target.value)}
                        type="tel"
                    />
                    <Input 
                        label={"Почта"} 
                        id={"email"} 
                        icon={Mail} 
                        value={formData.email}
                        placeholder="Почта"
                        onChange={(e) => handleChange('email', e.target.value)}
                        type="email"
                    />
                    <Input 
                        label={"Название для семьи"} 
                        id={"familyName"} 
                        value={formData.familyName}
                        placeholder="Напр. Семья Смирновых"
                        onChange={(e) => handleChange('familyName', e.target.value)}
                    />
                    <Input
                        label="Код"
                        id="login-password"
                        icon={Lock}
                        placeholder="Код подтверждения"
                        onChange={(e) => handleChange('code', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.button}>
                    <Button variant='primary' loading={loading} onClick={handleVerifyCode}>Регистрация</Button>
                </div>
                <div className={styles.button}>
                    <Button variant='outline' loading={loading} onClick={handleRequestCode}>Получить код</Button>
                </div>
                <div className={styles.toRegister}>
                    <span className={styles.toRegisterText}>У вас уже есть аккаунт?</span>
                    <NavLink
                        key={"/login"}
                        to={"/login"}
                        end={"/"}
                        className={styles.link}
                    >
                        Войти
                    </NavLink>
                </div>
                
            </div>
      </div>
    );
}

export default RegisterForm;