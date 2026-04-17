import styles from './Clients.module.scss';
import FamilyCard from "../../../components/FamilyCard/FamilyCard";
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { Search, Menu, Users, Plus } from 'lucide-react';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useState } from 'react';
import CreateFamilyModal from "../../../components/CreateFamilyModal/CreateFamilyModal";
import EmptyState from '../../../components/EmptyState/EmptyState';
import FamilyModal from '../../../components/FamilyModal/FamilyModal';
import EditParentModal from '../../../components/EditParentModal/EditParentModal';
import EditChildModal from '../../../components/EditChildModal/EditChildModal';
import ChildSubscriptionModal from '../../../components/ChildSubscriptionsModal/ChildSubscriptionsModal';
import CreateParentModal from '../../../components/CreateParentModal/CreateParentModal';
import CreateChildModal from '../../../components/CreateChildModal/CreateChildModal';

const Clients = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCrFamModalOpen, setIsCrFamModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [families, setFamilies] = useState([
      {
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
      },
      {
        id: 2,
        familyName: "Семья Самсоновых",
        createdAt: "2026-04-08T20:09:21.157Z",
        parents: [
          {
            id: 3,
            userId: 8,
            familyId: 2,
            user: {
              firstName: "Анастасия",
              lastName: "Самсонова",
              phone: "89999999992",
              email: "samsonova@educrm.ru",
            },
          },
        ],
        children: [
          {
            firstName: "Владислав",
            lastName: "Самсонов",
            birthDate: "2017-04-15T00:00:00.000Z",
          },
        ],
      },
      {
        id: 3,
        familyName: "Семья Смирновых",
        createdAt: "2026-04-08T20:09:21.159Z",
        parents: [
          {
            id: 4,
            userId: 9,
            familyId: 3,
            user: {
              firstName: "Максим",
              lastName: "Смирнов",
              phone: "89999999990",
              email: "smirnov@educrm.ru",
            },
          },
          {
            id: 5,
            userId: 10,
            familyId: 3,
            user: {
              firstName: "Ксения",
              lastName: "Смирнова",
              phone: "89999999991",
              email: "smirnova@educrm.ru",
            },
          },
        ],
        children: [
          {
            firstName: "Анастасия",
            lastName: "Смирнова",
            birthDate: "2018-03-25T00:00:00.000Z",
          },
          {
            firstName: "Мария",
            lastName: "Смирнова",
            birthDate: "2018-03-25T00:00:00.000Z",
          },
        ],
      },
    ]);
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

    const famItems = families.map((fam) => (
        <li key={fam.id}>
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
            <CreateFamilyModal isOpen={isCrFamModalOpen} onClose={() => setIsCrFamModalOpen(false)} parents={[]} children={[]} />
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
            />
            <EditParentModal
                parent={selectedParent}
                familyName={selectedFamily?.familyName}
                families={families}
                isOpen={editParent}
                onClose={() => {
                    setEditParent(false);
                    setSelectedParent(null);
                }}
            />
            <EditChildModal
                child={selectedChild}
                familyName={selectedFamily?.familyName}
                families={families}
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

export default Clients;