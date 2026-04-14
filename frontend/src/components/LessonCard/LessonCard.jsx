import styles from "./LessonCard.module.scss";
import { Pen, GraduationCap, AlarmClock, MapPin } from "lucide-react";
import Button from "../Button/Button";
import Card from "../Card/Card";
import Tag from "../Tag/Tag";
import { getLessonStatus } from "../../utils/helper";

const LessonCard = ({ lesson, onEdit, onMarkAttendance }) => {
    const color = lesson.status === 'SCHEDULED' ? 'purple' : lesson.status === 'COMPLETED' ? 'green' : 'red';

    return (
        <Card>
            <div className={styles.wrapper}>
                <div className={styles.block}>
                    <div className={styles.scheduleInfo}>
                        <h3 className={styles.clubName}>{lesson.club.name}</h3>
                        <div className={styles.tag}><Tag color={color} text={getLessonStatus(lesson.status)}></Tag></div>
                        <div className={styles.details}>
                            <div className={styles.time}>
                                <AlarmClock className={styles.icon} />
                                <p>{lesson.startTime} - {lesson.endTime}</p>
                            </div>
                            <div className={styles.teacher}>
                                <GraduationCap className={styles.icon} />
                                <p>{lesson.teacher.user.lastName} {lesson.teacher.user.firstName}</p>
                            </div>
                            <div className={styles.room}>
                                <MapPin className={styles.icon} />
                                <p>{lesson.room !== null ? lesson.room : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.button}>
                        <Button icon={Pen} variant='primary' onClick={onEdit} />
                    </div>
                </div>
                <Button variant='outline' onClick={onMarkAttendance}>Отметить посещаемость</Button>
            </div>
        </Card>
    );
}

export default LessonCard;