import styles from './AttendanceModal.module.scss';
import Button from '../Button/Button';
import LessonCard from '../LessonCard/LessonCard';
import AttendanceRecord from '../AttendanceRecord/AttendanceRecord';
import Modal from '../Modal/Modal';
import { formatDate } from '../../utils/helper';

const AttendanceModal = ({ lesson, attendance, onStatusChange, onMarkAttendance, isOpen, onClose }) => {
    const attendanceItems = attendance.map((record, index) => (
        <AttendanceRecord key={record.child.id} name={`${record.child.lastName} ${record.child.firstName}`} isPresent={record.isPresent} onToggle={() => onStatusChange(index)} />
    ));
    return (
        <Modal title={`Посещаемость - ${formatDate(lesson.date)}`} isOpen={isOpen} onClose={onClose}>
            <div className={styles.content}>
                <LessonCard lesson={lesson} isEditMode={false} isInModal={true} isMarkAttMode={false} />
                {attendanceItems}
            </div>
            <div className={styles.button}>
                <Button variant='primary' onClick={onMarkAttendance}>Отметить</Button>
            </div>
        </Modal>
    );
}

export default AttendanceModal;