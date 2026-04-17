import styles from './Teachers.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import EmptyState from '../../../components/EmptyState/EmptyState';
import TeacherCard from '../../../components/TeacherCard/TeacherCard';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Menu, Search, Plus, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import CreateTeacherModal from '../../../components/CreateTeacherModal/CreateTeacherModal';
import EditTeacherModal from '../../../components/EditTeacherModal/EditTeacherModal';

const Teachers = () => {
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [createTeacherModal, setCreateTeacherModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [teachers, setTeachers] = useState([
      {
        id: 5,
        email: "danilova@educrm.ru",
        firstName: "Анастасия",
        lastName: "Данилова",
        phone: "89999999995",
        role: "TEACHER",
        createdAt: "2026-04-08T20:09:21.151Z",
        teacher: {
          id: 4,
          specialty: "Актерское мастерство",
          clubs: [{ name: "Театр Взлёт" }, { name: "Кактус" }],
        },
        parent: null,
      },
      {
        id: 4,
        email: "sokolova@educrm.ru",
        firstName: "Мария",
        lastName: "Соколова",
        phone: "89999999996",
        role: "TEACHER",
        createdAt: "2026-04-08T20:09:21.150Z",
        teacher: {
          id: 3,
          specialty: "Психология",
          clubs: [{ name: "Калейдоскоп эмоций" }, { name: "Кактус" }],
        },
        parent: null,
      }
    ]);

    const teacherItems = teachers.map((teacher) => (
        <li key={teacher.id}>
            <TeacherCard
                teacher={teacher}
                onEdit={() => {
                    setSelectedTeacher(teacher);
                    setEditModal(true);
                }}
            />
        </li>
    ))

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Преподаватели</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setCreateTeacherModal(true)}>Добавить преподавателя</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Введите контактные данные семьи'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {teacherItems.length > 0 ? (
                    <div className={styles.teachers}>
                        <ul className={styles.list}>{teacherItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={GraduationCap}
                        title={'Нет клиентов'}
                        description={'Добавьте первую семью для начала работы'}
                        action={<Button icon={Plus} onClick={() => setCreateTeacherModal(true)}>Добавить семью</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreateTeacherModal isOpen={createTeacherModal} onClose={() => setCreateTeacherModal(false)} />
            <EditTeacherModal
                user={selectedTeacher}
                isOpen={editModal} 
                onClose={() => {
                    setEditModal(false);
                    setSelectedTeacher(null);
                }}
            />
        </>
    );
}

export default Teachers;