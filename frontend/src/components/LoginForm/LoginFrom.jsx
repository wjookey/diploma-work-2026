import styles from './LoginForm.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Mail, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const LoginForm = ({ loading, onSubmit, onCodeRequest, onEmailChange, onPasswordChange }) => {
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
                    <Input
                        label="Почта"
                        id="login-email"
                        icon={Mail}
                        onChange={onEmailChange}
                        required
                        placeholder="Почта"
                    />
                    <Input
                        label="Код"
                        id="login-password"
                        icon={Lock}
                        onChange={onPasswordChange}
                        required
                        placeholder="Код подтверждения"
                    />
                </div>
                <div className={styles.button}>
                    <Button variant='primary' loading={loading} onClick={onSubmit}>Войти</Button>
                </div>
                <div className={styles.button}>
                    <Button variant='outline' loading={loading} onClick={onCodeRequest}>Получить код</Button>
                </div>
                <div className={styles.toRegister}>
                    <span className={styles.toRegisterText}>Ещё не зарегистрированы?</span>
                    <NavLink
                        key={"/register"}
                        to={"/register"}
                        end={"/"}
                        className={styles.link}
                    >
                        Зарегистрироваться
                    </NavLink>
                </div>
                
            </div>
      </div>
    );
}

export default LoginForm;