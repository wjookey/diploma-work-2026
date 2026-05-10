import styles from './Register.module.scss';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const { requestCode, verifyCode } = useAuth();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await verifyCode(formData.email, formData.code);
            toast.success('Добро пожаловать!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCode = async (formData) => {
        setLoading(true);
        try {
            await requestCode({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                familyName: formData.familyName,
            });
            toast.success('Код отправлен на почту');
        } catch (err) {
            toast.error(err.response?.data?.message || "Ошибка получения кода");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.info}>
                <h2 className={styles.header}>Пристань авантюристов</h2>
                <h3 className={styles.subheader}>Управление дополнительным образованием</h3>
                <img src="logo.svg" alt="Логотип" className={styles.logo} />
            </div>
            <RegisterForm
                loading={loading}
                onSubmit={handleSubmit}
                onCodeRequest={handleRequestCode}
            />
        </div>
    );
}

export default Register;