import styles from './StatsCard.module.scss';
import Card from '../Card/Card';

const StatsCard = ({ title, data, icon: Icon }) => {
    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.details}>
                    <p className={styles.title}>{title}</p>
                    <p className={styles.data}>{data}</p>
                </div>
                <div className={styles.iconBlock}>
                    <Icon className={styles.icon} />
                </div>
            </div>
        </Card>
    );
}

export default StatsCard;