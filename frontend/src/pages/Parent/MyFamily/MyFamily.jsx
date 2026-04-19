import styles from './MyFamily.module.scss';
import FamilyCard from "../../../components/FamilyCard/FamilyCard";
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Search, Menu, Users, Plus } from 'lucide-react';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useState } from 'react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import FamilyModal from '../../../components/FamilyModal/FamilyModal';
import EditParentModal from '../../../components/EditParentModal/EditParentModal';
import EditChildModal from '../../../components/EditChildModal/EditChildModal';
import ChildSubscriptionModal from '../../../components/ChildSubscriptionsModal/ChildSubscriptionsModal';
import CreateParentModal from '../../../components/CreateParentModal/CreateParentModal';
import CreateChildModal from '../../../components/CreateChildModal/CreateChildModal';

const MyFamily = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCrFamModalOpen, setIsCrFamModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [family, setFamily] = useState({
        id: 1,
        familyName: "Семья Давыдовых",
        createdAt: "2026-04-08T20:09:21.153Z",
        parents: [
          {
            id: 1,
            userId: 6,
            familyId: 1,
            user: {
              firstName: "Дмитрий",
              lastName: "Давыдова",
              phone: "89999999993",
              email: "davydov@educrm.ru",
            },
          },
          {
            id: 2,
            userId: 7,
            familyId: 1,
            user: {
              firstName: "Александра",
              lastName: "Давыдова",
              phone: "89999999994",
              email: "davydova@educrm.ru",
            },
          },
        ],
        children: [
          {
            firstName: "Артём",
            lastName: "Давыдов",
            birthDate: "2016-03-15T00:00:00.000Z",
          },
          {
            firstName: "Алиса",
            lastName: "Давыдова",
            birthDate: "2018-07-22T00:00:00.000Z",
          },
        ],
    });
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
                        familyName={family.familyName}
                        parents={family.parents}
                        children={family.children}
                        onEdit={() => {
                            setEditFamily(true);
                            setSelectedFamily(family);
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
                isAdminMode={false}
            />
            <EditParentModal
                parent={selectedParent}
                familyName={selectedFamily?.familyName}
                families={[]}
                isOpen={editParent}
                onClose={() => {
                    setEditParent(false);
                    setSelectedParent(null);
                }}
            />
            <EditChildModal
                child={selectedChild}
                familyName={selectedFamily?.familyName}
                families={[]}
                isOpen={editChild}
                onClose={() => {
                    setEditChild(false);
                    setSelectedChild(null);
                }}
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
            />
            <CreateChildModal
                isOpen={addChild}
                onClose={() => setAddChild(false)}
            />
        </>
    );
}

export default MyFamily;