import styles from './Clients.module.scss';
import FamilyCard from "../../../components/FamilyCard/FamilyCard";
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Search, Menu, Users, Plus } from 'lucide-react';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useState, useEffect } from 'react';
import CreateFamilyModal from "../../../components/CreateFamilyModal/CreateFamilyModal";
import EmptyState from '../../../components/EmptyState/EmptyState';
import FamilyModal from '../../../components/FamilyModal/FamilyModal';
import EditParentModal from '../../../components/EditParentModal/EditParentModal';
import EditChildModal from '../../../components/EditChildModal/EditChildModal';
import ChildSubscriptionModal from '../../../components/ChildSubscriptionsModal/ChildSubscriptionsModal';
import CreateParentModal from '../../../components/CreateParentModal/CreateParentModal';
import CreateChildModal from '../../../components/CreateChildModal/CreateChildModal';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import Loader from '../../../components/Loader/Loader';

const Clients = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCrFamModalOpen, setIsCrFamModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [families, setFamilies] = useState([]);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [editFamily, setEditFamily] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [editParent, setEditParent] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [editChild, setEditChild] = useState(false);
    const [selectedChildSubs, setSelectedChildSubs] = useState(null);
    const [watchChildSubs, setWatchChildSubs] = useState(false);
    const [addParent, setAddParent] = useState(false);
    const [addChild, setAddChild] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Состояния для создания новой семьи
    const [familyName, setFamilyName] = useState('');
    const [parentForm, setParentForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [parents, setParents] = useState([]);
    const [childForm, setChildForm] = useState({ firstName: '', lastName: '', birthDate: '' });
    const [children, setChildren] = useState([]);
    const [creatingFamily, setCreatingFamily] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const url = search ? `/families?search=${encodeURIComponent(search)}` : '/families';
                const res = await api.get(url);
                setFamilies(res.data.data);
            } catch (error) {
                toast.error("Ошибка загрузки данных клиентов");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [search, editFamily, isCrFamModalOpen]);

    const handleParentFormChange = (field, value) => {
        setParentForm(prev => ({ ...prev, [field]: value }));
    };

    const handleParentAdd = () => {
        if (!parentForm.firstName || !parentForm.lastName || !parentForm.email || !parentForm.phone) {
            toast.error('Заполните все поля родителя');
            return;
        }
        
        setParents(prev => [...prev, { ...parentForm }]);
        setParentForm({ firstName: '', lastName: '', email: '', phone: '' });
        toast.success('Родитель добавлен');
    };

    const handleParentRemove = (index) => {
        setParents(prev => prev.filter((_, i) => i !== index));
        toast.success('Родитель удален');
    };

    const handleChildFormChange = (field, value) => {
        setChildForm(prev => ({ ...prev, [field]: value }));
    };

    const handleChildAdd = () => {
        if (!childForm.firstName || !childForm.lastName) {
            toast.error('Заполните имя и фамилию ребенка');
            return;
        }
        
        setChildren(prev => [...prev, { ...childForm }]);
        setChildForm({ firstName: '', lastName: '', birthDate: '' });
        toast.success('Ребенок добавлен');
    };

    const handleChildRemove = (index) => {
        setChildren(prev => prev.filter((_, i) => i !== index));
        toast.success('Ребенок удален');
    };

    const handleCreateFamily = async () => {
        if (!familyName) {
            toast.error('Введите имя семьи');
            return;
        }
        
        if (parents.length === 0) {
            toast.error('Добавьте хотя бы одного родителя');
            return;
        }
        
        if (children.length === 0) {
            toast.error('Добавьте хотя бы одного ребенка');
            return;
        }

        setCreatingFamily(true);
        try {
            const payload = {
                familyName,
                parents: parents.map(p => ({
                    user: {
                        firstName: p.firstName,
                        lastName: p.lastName,
                        email: p.email,
                        phone: p.phone,
                        password: 'password123'
                    }
                })),
                children: children.map(c => ({
                    firstName: c.firstName,
                    lastName: c.lastName,
                    birthDate: c.birthDate || null,
                    note: ''
                }))
            };

            await api.post('/families', payload);
            toast.success('Семья успешно создана');
            
            setFamilyName('');
            setParentForm({ firstName: '', lastName: '', email: '', phone: '' });
            setParents([]);
            setChildForm({ firstName: '', lastName: '', birthDate: '' });
            setChildren([]);
            setIsCrFamModalOpen(false);
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания семьи');
            console.error(error);
        } finally {
            setCreatingFamily(false);
        }
    };

    const handleAddParentToFamily = async (parentData) => {
        setSubmittingEdit(true);
        try {
            const payload = {
                user: {
                    firstName: parentData.firstName,
                    lastName: parentData.lastName,
                    email: parentData.email,
                    phone: parentData.phone,
                    password: 'password123'
                },
                familyId: selectedFamily.id
            };

            await api.post('/users', { ...payload.user, role: 'PARENT', familyId: selectedFamily.id });
            toast.success('Родитель добавлен к семье');
            
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setAddParent(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления родителя');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleAddChildToFamily = async (childData) => {
        setSubmittingEdit(true);
        try {
            const payload = {
                firstName: childData.firstName,
                lastName: childData.lastName,
                birthDate: childData.birthDate || null,
                familyId: selectedFamily.id
            };

            await api.post('/children', payload);
            toast.success('Ребенок добавлен к семье');
            
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setAddChild(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления ребенка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateParent = async (parentData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${parentData.user.id}`, {
                firstName: parentData.user.firstName,
                lastName: parentData.user.lastName,
                phone: parentData.user.phone,
                email: parentData.user.email
            });
            toast.success('Данные родителя обновлены');
            
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setEditParent(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления родителя');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteParent = async (userId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/users/${userId}`);
            toast.success('Родитель удален');
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setEditParent(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления родителя');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateChild = async (childData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/children/${childData.id}`, {
                firstName: childData.firstName,
                lastName: childData.lastName,
                birthDate: childData.birthDate || null
            });
            toast.success('Данные ребенка обновлены');
            
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setEditChild(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления ребенка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteChild = async (childId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/children/${childId}`);
            toast.success('Ребенок удален');
            
            const familyRes = await api.get(`/families/${selectedFamily.id}`);
            setSelectedFamily(familyRes.data.data);
            setEditChild(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления ребенка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteFamily = async () => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/families/${selectedFamily.id}`);
            toast.success('Семья удалена');
            
            setEditFamily(false);
            setSelectedFamily(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления семьи');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    if (loading) return <Loader />;

    const famItems = families.map((fam) => (
        <li key={fam.id} className={styles.listItem}>
            <FamilyCard
                familyName={fam.familyName}
                parents={fam.parents}
                children={fam.children}
                onEdit={() => {
                    setEditFamily(true);
                    setSelectedFamily(fam);
                }}
                
                onWatchDetailed={(child) => {
                    setSelectedChildSubs(child?.subscriptions)
                    setWatchChildSubs(true)
                }}
            />
        </li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Клиенты</h1>
                </div>
                <div className={styles.button}><Button variant='primary' onClick={() => setIsCrFamModalOpen(true)}>Добавить семью</Button></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Введите контактные данные семьи'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {famItems.length > 0 ? (
                    <div className={styles.families}>
                        <ul className={styles.list}>{famItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        title={'Нет клиентов'}
                        description={'Добавьте первую семью для начала работы'}
                        action={<Button icon={Plus} onClick={() => setIsCrFamModalOpen(true)}>Добавить семью</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreateFamilyModal 
                isOpen={isCrFamModalOpen} 
                onClose={() => {
                    setIsCrFamModalOpen(false);
                    // Очищаем форму при закрытии
                    setFamilyName('');
                    setParentForm({ firstName: '', lastName: '', email: '', phone: '' });
                    setParents([]);
                    setChildForm({ firstName: '', lastName: '', birthDate: '' });
                    setChildren([]);
                }}
                familyName={familyName}
                onFamilyNameChange={setFamilyName}
                parentForm={parentForm}
                onParentFormChange={handleParentFormChange}
                parents={parents}
                onParentAdd={handleParentAdd}
                onParentRemove={handleParentRemove}
                childForm={childForm}
                onChildFormChange={handleChildFormChange}
                children={children}
                onChildAdd={handleChildAdd}
                onChildRemove={handleChildRemove}
                onSubmit={handleCreateFamily}
                loading={creatingFamily}
            />
            <FamilyModal
                familyId={selectedFamily?.id}
                familyName={selectedFamily?.familyName}
                parents={selectedFamily?.parents || []}
                children={selectedFamily?.children || []}
                isOpen={editFamily}
                onClose={() => {
                    setEditFamily(false);
                    setSelectedFamily(null);
                }}
                onParentEdit={(parent) => {
                    setSelectedParent(parent);
                    setEditParent(true);
                }}
                onChildEdit={(child) => {
                    setSelectedChild(child);
                    setEditChild(true);
                }}
                onParentAdd={() => setAddParent(true)}
                onChildAdd={() => setAddChild(true)}
                onDelete={handleDeleteFamily}
            />
            <EditParentModal
                parent={selectedParent}
                isOpen={editParent}
                onClose={() => {
                    setEditParent(false);
                    setSelectedParent(null);
                }}
                onSubmit={handleUpdateParent}
                onDelete={handleDeleteParent}
                loading={submittingEdit}
            />
            <EditChildModal
                child={selectedChild}
                isOpen={editChild}
                onClose={() => {
                    setEditChild(false);
                    setSelectedChild(null);
                }}
                onSubmit={handleUpdateChild}
                onDelete={handleDeleteChild}
                loading={submittingEdit}
            />
            <ChildSubscriptionModal
                subscriptions={selectedChildSubs || []}
                isOpen={watchChildSubs}
                onClose={() => {
                    setWatchChildSubs(false);
                    setSelectedChildSubs(null);
                }}
            />
            <CreateParentModal
                isOpen={addParent}
                onClose={() => setAddParent(false)}
                onAdd={handleAddParentToFamily}
                loading={submittingEdit}
            />
            <CreateChildModal
                isOpen={addChild}
                onClose={() => setAddChild(false)}
                onAdd={handleAddChildToFamily}
                loading={submittingEdit}
            />
        </>
    );
}

export default Clients;