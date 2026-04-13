import styles from './LoginForm.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Lock } from 'lucide-react';

const LoginForm = ({loading, onButtonClick}) => {
    return (
        <div className={styles.layout}>
            <div className={styles.textBlock}>
                <h2 className={styles.title}>Вход в систему</h2>
                <p className={styles.description}>
                    Введите данные вашей учетной записи
                </p>
            </div>
            <div className={styles.formBlock}>
                <div className={styles.inputsBlock}>
                    <Input label="Почта" id="login-email" icon={Mail} />
                    <Input label="Пароль" id="login-password" icon={Lock} />
                </div>
                <div className={styles.button}>
                    <Button variant='primary' loading={loading} onClick={onButtonClick}>Войти</Button>
                </div>
            </div>
      </div>
    );
}

export default LoginForm;