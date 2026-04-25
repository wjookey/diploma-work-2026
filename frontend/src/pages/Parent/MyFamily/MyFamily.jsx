import styles from './MyFamily.module.scss';
import FamilyCard from "../../../components/FamilyCard/FamilyCard";
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Search, Menu, Users, Plus } from 'lucide-react';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useState, useEffect } from 'react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import FamilyModal from '../../../components/FamilyModal/FamilyModal';
import EditParentModal from '../../../components/EditParentModal/EditParentModal';
import EditChildModal from '../../../components/EditChildModal/EditChildModal';
import ChildSubscriptionModal from '../../../components/ChildSubscriptionsModal/ChildSubscriptionsModal';
import CreateParentModal from '../../../components/CreateParentModal/CreateParentModal';
import CreateChildModal from '../../../components/CreateChildModal/CreateChildModal';
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";
import { useAuth } from '../../../context/AuthContext';

const MyFamily = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [family, setFamily] = useState({});
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
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get(`/families/${user.parent.family.id}`);
                setFamily(res.data.data);
                console.log(family)
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [addChild, addParent, editChild, editParent]);

    const handleAddParent = async (parentForm) => {
        setCreatingItem(true);
        try {
            const data = {
                user: {
                    firstName: parentForm.firstName,
                    lastName: parentForm.lastName,
                    email: parentForm.email,
                    phone: parentForm.phone,
                    password: 'password123',
                },
                familyId: family.id,
            };

            await api.post('/users', { ...data.user, role: 'PARENT', familyId: data.familyId });
            toast.success('Родитель добавлен к семье');

            setAddParent(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления родителя');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleAddChild = async (childForm) => {
        setCreatingItem(true);
        try {
            const data = {
                firstName: childForm.firstName,
                lastName: childForm.lastName,
                birthDate: childForm.birthDate || null,
                familyId: family.id,
            };

            await api.post('/children', data);
            toast.success('Ребенок добавлен к семье');

            setAddChild(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления родителя');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdateParent = async (parentForm) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${parentForm.user.id}`, {
                firstName: parentForm.user.firstName,
                lastName: parentForm.user.lastName,
                phone: parentForm.user.phone,
                email: parentForm.user.email
            });
            toast.success('Данные родителя обновлены');
            
            setEditParent(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления родителя');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateChild = async (childForm) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/children/${childForm.id}`, {
                firstName: childForm.firstName,
                lastName: childForm.lastName,
                birthDate: childForm.birthDate || null
            });
            toast.success('Данные ребенка обновлены');
            
            setEditChild(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления ребенка');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Моя семья</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.family}>
                    <FamilyCard
                        familyName={family?.familyName}
                        parents={family?.parents || []}
                        children={family?.children || []}
                        onEdit={() => {
                            setEditFamily(true);
                        }}
                        onWatchDetailed={(child) => {
                            setSelectedChildSubs(child?.subscriptions)
                            setWatchChildSubs(true)
                        }}
                     />
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <FamilyModal
                familyName={family?.familyName}
                parents={family?.parents || []}
                children={family?.children || []}
                isOpen={editFamily}
                onClose={() => {
                    setEditFamily(false);
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
                isAdminMode={false}
            />
            <EditParentModal
                parent={selectedParent}
                isOpen={editParent}
                onClose={() => {
                    setEditParent(false);
                    setSelectedParent(null);
                }}
                onSubmit={handleUpdateParent}
                loading={submittingEdit}
                isAdminMode={false}
            />
            <EditChildModal
                child={selectedChild}
                isOpen={editChild}
                onClose={() => {
                    setEditChild(false);
                    setSelectedChild(null);
                }}
                onSubmit={handleUpdateChild}
                loading={submittingEdit}
                isAdminMode={false}
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
                onAdd={handleAddParent}
                loading={creatingItem}
            />
            <CreateChildModal
                isOpen={addChild}
                onClose={() => setAddChild(false)}
                onAdd={handleAddChild}
                loading={creatingItem}
            />
        </>
    );
}

export default MyFamily;