import { useEffect, useState } from "react";
import "./App.css";
import Input from "./components/Input/Input";
import Select from "./components/Select/Select";
import Loader from "./components/Loader/Loader";
import Card from "./components/Card/Card";
import EmptyState from "./components/EmptyState/EmptyState";
import Modal from "./components/Modal/Modal";
import Tag from "./components/Tag/Tag";
import Button from "./components/Button/Button";
import LoginForm from "./components/LoginForm/LoginFrom";
import SidebarLink from "./components/SidebarLink/SidebarLink";
import SidebarFooter from "./components/SidebarFooter/SidebarFooter";
import SidebarHeader from "./components/SidebarHeader/SidebarHeader";
import Sidebar from "./layout/Sidebar/Sidebar";
import ParentCard from "./components/ParentCard/ParentCard";
import TeacherCard from "./components/TeacherCard/TeacherCard";
import ChildCard from "./components/ChildCard/ChildCard";
import FamilyCard from "./components/FamilyCard/FamilyCard";
import ChildSubscriptionCard from "./components/ChildSubscriptionCard/ChildSubscriptionCard";
import ChildSubscriptionsModal from "./components/ChildSubscriptionsModal/ChildSubscriptionsModal";
import ClubCategoryCard from "./components/ClubCategoryCard/ClubCategoryCard";
import ClubCard from "./components/ClubCard/ClubCard";
import ClubServiceCard from "./components/ClubServiceCard/ClubServiceCard";
import ScheduleCard from "./components/ScheduleCard/ScheduleCard";
import LessonCard from "./components/LessonCard/LessonCard";
import SubscriptionCard from "./components/SubscriptionCard/SubscriptionCard";
import PaymentCard from "./components/PaymentCard/PaymentCard";
import RequestCard from "./components/RequestCard/RequestCard";
import AttendanceRecord from "./components/AttendanceRecord/AttendanceRecord";
import AttendanceModal from "./components/AttendanceModal/AttendanceModal";
import FamilyModal from "./components/FamilyModal/FamilyModal";
import SubDetailed from "./components/SubDetailed/SubDetailed";
import CreateFamilyModal from "./components/CreateFamilyModal/CreateFamilyModal";
import CreateParentModal from "./components/CreateParentModal/CreateParentModal";
import EditParentModal from "./components/EditParentModal/EditParentModal";
import { Church, Search } from "lucide-react";
import CreateChildModal from "./components/CreateChildModal/CreateChildModal";
import EditChildModal from "./components/EditChildModal/EditChildModal";
import CreateTeacherModal from "./components/CreateTeacherModal/CreateTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal/EditTeacherModal";
import CreateClubCatModal from "./components/CreateClubCatModal/CreateClubCatModal";
import EditClubCatModal from "./components/EditClubCatModal/EditClubCatModal";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(true);
  const [isChildSubModalOpen, setIsChildSubModalOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const parents = [
    {
      lastName: "Miacheva",
      firstName: "Elena",
      email: "miacheva@yandex.ru",
      phone: "89524442055",
      key: 1,
    },
    {
      lastName: "Miacheva",
      firstName: "Elena",
      email: "miacheva@yandex.ru",
      phone: "89524442055",
      key: 2,
    },
  ];
  const children = [
    {
      lastName: "Miacheva",
      firstName: "Elena",
      birthDate: "30.04.2004",
      key: 1,
    },
    {
      lastName: "Miacheva",
      firstName: "Elena",
      birthDate: "30.04.2004",
      key: 2,
    },
  ];

  const sub = {
    id: 5,
    childId: 4,
    clubId: 1,
    clubServiceId: 3,
    remainingLessons: 6,
    usedFreezes: 0,
    stateUpdateDate: null,
    startDate: "2026-04-05T00:00:00.000Z",
    endDate: null,
    status: "ACTIVE",
    createdAt: "2026-04-08T20:09:21.199Z",
    updatedAt: "2026-04-08T20:09:21.199Z",
    child: {
      id: 4,
      firstName: "Анастасия",
      lastName: "Смирнова",
    },
    payment: null,
    clubService: {
      id: 3,
      name: "Абонемент на 6 занятий",
      price: 4500,
      subscriptionLessons: 6,
      freezedLesson: 0,
      clubId: 1,
      type: "SUBSCRIPTION",
      isActive: true,
      createdAt: "2026-04-08T20:09:21.172Z",
      club: {
        id: 1,
        name: "Музыкальная энциклопедия",
      },
    },
  };

  const subs = [
    {
      id: 6,
      childId: 4,
      clubId: 5,
      clubServiceId: 18,
      remainingLessons: 12,
      usedFreezes: 0,
      stateUpdateDate: null,
      startDate: "2026-04-14T21:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
      createdAt: "2026-04-14T14:57:33.642Z",
      updatedAt: "2026-04-14T14:57:33.642Z",
      child: {
        id: 4,
        firstName: "Анастасия",
        lastName: "Смирнова",
      },
      clubService: {
        id: 18,
        name: "Абонемент на 12 занятий (+2 заморозки)",
        price: 10800,
        subscriptionLessons: 12,
        freezedLesson: 2,
        clubId: 5,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.186Z",
        club: {
          id: 5,
          name: "Театр Взлёт",
        },
      },
      payment: null,
    },
    {
      id: 5,
      childId: 4,
      clubId: 1,
      clubServiceId: 3,
      remainingLessons: 6,
      usedFreezes: 0,
      stateUpdateDate: null,
      startDate: "2026-04-05T00:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
      createdAt: "2026-04-08T20:09:21.199Z",
      updatedAt: "2026-04-08T20:09:21.199Z",
      child: {
        id: 4,
        firstName: "Анастасия",
        lastName: "Смирнова",
      },
      clubService: {
        id: 3,
        name: "Абонемент на 6 занятий",
        price: 4500,
        subscriptionLessons: 6,
        freezedLesson: 0,
        clubId: 1,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.172Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
        },
      },
      payment: null,
    },
    {
      id: 4,
      childId: 4,
      clubId: 5,
      clubServiceId: 18,
      remainingLessons: 12,
      usedFreezes: 0,
      stateUpdateDate: null,
      startDate: "2026-04-14T21:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
      createdAt: "2026-04-14T14:57:33.642Z",
      updatedAt: "2026-04-14T14:57:33.642Z",
      child: {
        id: 4,
        firstName: "Анастасия",
        lastName: "Смирнова",
      },
      clubService: {
        id: 18,
        name: "Абонемент на 12 занятий (+2 заморозки)",
        price: 10800,
        subscriptionLessons: 12,
        freezedLesson: 2,
        clubId: 5,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.186Z",
        club: {
          id: 5,
          name: "Театр Взлёт",
        },
      },
      payment: null,
    },
    {
      id: 3,
      childId: 4,
      clubId: 1,
      clubServiceId: 3,
      remainingLessons: 6,
      usedFreezes: 0,
      stateUpdateDate: null,
      startDate: "2026-04-05T00:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
      createdAt: "2026-04-08T20:09:21.199Z",
      updatedAt: "2026-04-08T20:09:21.199Z",
      child: {
        id: 4,
        firstName: "Анастасия",
        lastName: "Смирнова",
      },
      clubService: {
        id: 3,
        name: "Абонемент на 6 занятий",
        price: 4500,
        subscriptionLessons: 6,
        freezedLesson: 0,
        clubId: 1,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.172Z",
        club: {
          id: 1,
          name: "Музыкальная энциклопедия",
        },
      },
      payment: null,
    },
  ];

  const clubCat = {
    id: 1,
    name: "Музыкальные занятия",
    description: null,
    isActive: true,
    createdAt: "2026-04-08T20:09:21.161Z",
    clubs: [
      {
        name: "Музыкальные истории",
        description: null,
      },
      {
        name: "Музыкальная энциклопедия",
        description: null,
      },
    ],
  };

  const club = {
    id: 4,
    name: "Кактус",
    description: null,
    classCategoryId: 2,
    defaultTeacherId: 3,
    maxStudents: null,
    isActive: true,
    createdAt: "2026-04-08T20:09:21.164Z",
    clubCategory: {
      id: 2,
      name: "Психологические занятия",
      description: null,
      isActive: true,
    },
    teacher: {
      id: 3,
      userId: 4,
      specialty: "Психология",
      bio: null,
      user: {
        firstName: "Мария",
        lastName: "Соколова",
        phone: "89999999996",
        email: "sokolova@educrm.ru",
      },
    },
  };

  const service = {
    id: 18,
    name: "Абонемент на 12 занятий (+2 заморозки)",
    price: 10800,
    subscriptionLessons: 12,
    freezedLesson: 2,
    clubId: 5,
    type: "SUBSCRIPTION",
    isActive: true,
    createdAt: "2026-04-08T20:09:21.186Z",
    club: {
      id: 5,
      name: "Театр Взлёт",
      description: null,
      classCategoryId: 3,
      defaultTeacherId: 4,
      maxStudents: null,
      isActive: true,
      createdAt: "2026-04-08T20:09:21.165Z",
      teacher: {
        id: 4,
        userId: 5,
        specialty: "Актерское мастерство",
        bio: null,
        user: {
          firstName: "Мария",
          lastName: "Соколова",
        },
      },
      clubCategory: {
        id: 3,
        name: "Развивающие занятия",
        description: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.162Z",
      },
    },
  };

  const schedule = {
    startTime: "15:00",
    endTime: "15:30",
    room: null,
    club: {
      name: "Кактус",
      teacher: {
        user: {
          lastName: "Соколова",
          firstName: "Мария",
        },
      },
    },
  };

  const lesson = {
    id: 1,
    clubId: 1,
    date: "2026-04-05T00:00:00.000Z",
    startTime: "17:00",
    endTime: "18:30",
    room: null,
    topic: null,
    status: "SCHEDULED",
    assignedTeacherId: 1,
    createdAt: "2026-04-08T20:09:21.190Z",
    club: {
      id: 1,
      name: "Музыкальная энциклопедия",
    },
    teacher: {
      id: 1,
      userId: 2,
      specialty: "Музыка",
      bio: null,
      user: {
        firstName: "Елена",
        lastName: "Иванова",
      },
    },
    attendances: [],
  };

  const payment = {
    id: 1,
    subscriptionId: 1,
    amount: 8400,
    paymentDate: "2026-04-03T00:00:00.000Z",
    note: null,
    createdAt: "2026-04-08T20:09:21.200Z",
    subscription: {
      id: 1,
      childId: 1,
      clubId: 4,
      clubServiceId: 14,
      remainingLessons: 12,
      usedFreezes: 0,
      stateUpdateDate: null,
      startDate: "2026-04-06T00:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
      createdAt: "2026-04-08T20:09:21.195Z",
      updatedAt: "2026-04-08T20:09:21.195Z",
      child: {
        id: 1,
        firstName: "Артём",
        lastName: "Давыдов",
        birthDate: "2016-03-15T00:00:00.000Z",
        familyId: 1,
        note: null,
        createdAt: "2026-04-08T20:09:21.153Z",
        family: {
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
              },
            },
            {
              id: 2,
              userId: 7,
              familyId: 1,
              user: {
                firstName: "Александра",
                lastName: "Давыдова",
              },
            },
          ],
        },
      },
      clubService: {
        id: 14,
        name: "Абонемент на 12 занятий (+2 заморозки)",
        price: 8400,
        subscriptionLessons: 12,
        freezedLesson: 2,
        clubId: 4,
        type: "SUBSCRIPTION",
        isActive: true,
        createdAt: "2026-04-08T20:09:21.183Z",
        club: {
          id: 4,
          name: "Кактус",
        },
      },
    },
  };

  const request = {
    id: 2,
    familyId: 3,
    childId: 5,
    clubServiceId: 21,
    message: null,
    status: "PENDING",
    createdAt: "2026-04-08T20:09:21.202Z",
    updatedAt: "2026-04-08T20:09:21.202Z",
    family: {
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
    },
    child: {
      id: 5,
      firstName: "Мария",
      lastName: "Смирнова",
    },
    clubService: {
      id: 21,
      name: "Абонемент на 12 занятий (+2 заморозки)",
      price: 6000,
      subscriptionLessons: 12,
      freezedLesson: 2,
      clubId: 6,
      type: "SUBSCRIPTION",
      isActive: true,
      createdAt: "2026-04-08T20:09:21.188Z",
      club: {
        id: 6,
        name: "Фотокружок",
      },
    },
  };

  useEffect(() => {
    const lessonSubs = [
      {
        id: 5,
        childId: 4,
        clubId: 1,
        clubServiceId: 3,
        remainingLessons: 6,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-05T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.199Z",
        updatedAt: "2026-04-08T20:09:21.199Z",
        child: {
          id: 4,
          firstName: "Анастасия",
          lastName: "Смирнова",
        },
        clubService: {
          id: 3,
          name: "Абонемент на 6 занятий",
          price: 4500,
          subscriptionLessons: 6,
          freezedLesson: 0,
          clubId: 1,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.172Z",
          club: {
            id: 1,
            name: "Музыкальная энциклопедия",
          },
        },
        payment: null,
      },
      {
        id: 3,
        childId: 2,
        clubId: 1,
        clubServiceId: 2,
        remainingLessons: 12,
        usedFreezes: 0,
        stateUpdateDate: null,
        startDate: "2026-04-05T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
        createdAt: "2026-04-08T20:09:21.197Z",
        updatedAt: "2026-04-08T20:09:21.197Z",
        child: {
          id: 2,
          firstName: "Алиса",
          lastName: "Давыдова",
        },
        clubService: {
          id: 2,
          name: "Абонемент на 12 занятий (+2 заморозки)",
          price: 8400,
          subscriptionLessons: 12,
          freezedLesson: 2,
          clubId: 1,
          type: "SUBSCRIPTION",
          isActive: true,
          createdAt: "2026-04-08T20:09:21.171Z",
          club: {
            id: 1,
            name: "Музыкальная энциклопедия",
          },
        },
        payment: {
          id: 2,
          amount: 8400,
        },
      },
    ];
    const lesson = {
      id: 1,
      clubId: 1,
      date: "2026-04-05T00:00:00.000Z",
      startTime: "17:00",
      endTime: "18:30",
      room: null,
      topic: null,
      status: "SCHEDULED",
      assignedTeacherId: 1,
      createdAt: "2026-04-08T20:09:21.190Z",
      club: {
        id: 1,
        name: "Музыкальная энциклопедия",
      },
      teacher: {
        id: 1,
        userId: 2,
        specialty: "Музыка",
        bio: null,
        user: {
          firstName: "Елена",
          lastName: "Иванова",
        },
      },
      attendances: [],
    };
    const data =
      lesson.attendances.length > 0
        ? lesson.attendances
        : lessonSubs.map((sub) => ({
            child: sub.child,
            isPresent: false,
          }));
    console.log(attendance);
    setAttendance(data);
  }, []);

  const user = {
            "id": 9,
            "email": "smirnov@educrm.ru",
            "firstName": "Максим",
            "lastName": "Смирнов",
            "phone": "89999999990",
            "role": "PARENT",
            "createdAt": "2026-04-08T20:09:21.159Z",
            "teacher": null,
            "parent": {
                "id": 4,
                "family": {
                  "id": 3,
                  "familyName": "Семья Смирновых",
                    "children": [
                        {
                            "id": 4,
                            "firstName": "Анастасия",
                            "lastName": "Смирнова",
                            "birthDate": "2018-03-25T00:00:00.000Z"
                        },
                        {
                            "id": 5,
                            "firstName": "Мария",
                            "lastName": "Смирнова",
                            "birthDate": "2018-03-25T00:00:00.000Z"
                        }
                    ]
                }
            }
  }
  const child = {
    "id": 4,
    "firstName": "Анастасия",
    "lastName": "Смирнова",
    "birthDate": "2018-03-25T00:00:00.000Z",
    "familyId": 3,
    "note": null,
    "createdAt": "2026-04-08T20:09:21.159Z",
    "family": {
      "id": 3,
      "familyName": "Семья Смирновых",
      "createdAt": "2026-04-08T20:09:21.159Z",
      "parents": [
        {
          "id": 4,
          "userId": 9,
          "familyId": 3,
          "user": {
            "firstName": "Максим",
            "lastName": "Смирнов",
            "phone": "89999999990",
            "email": "smirnov@educrm.ru"
          }
        },
        {
          "id": 5,
          "userId": 10,
          "familyId": 3,
          "user": {
            "firstName": "Ксения",
            "lastName": "Смирнова",
            "phone": "89999999991",
            "email": "smirnova@educrm.ru"
          }
        }
      ]
    }
  }

  const cat = {
    name: "Psychological Classes",
    description: "Classes which are expected to improve child's emotional awareness bla bla bla",
    isActive: true
  }

  const array = [1, 2, 3, 4, 5];

  const handleStatusChange = (index) => {
    const updated = [...attendance];
    updated[index].isPresent = !updated[index].isPresent;
    setAttendance(updated);
  };

  return (
    <>
      <section id="center">
        <div id="main">
          <h1>Get started</h1>
          <Input icon={Search} label="Search" id="search" />

          <Select
            label="Age"
            id="age"
            placeholder="All clubs"
            options={array.map((c) => ({ value: c, label: c }))}
          />

          <Loader />

          <EmptyState
            title="No Requests"
            description="Create new request"
            action={<button>Create</button>}
          />

          <Card onClick={() => setIsOpen(!isOpen)}>gvwerhth</Card>

          <Modal
            isOpen={isOpen}
            title="Modal header"
            size="md"
            onClose={() => setIsOpen(!isOpen)}
          >
            bwtnhmntt
          </Modal>

          <Tag color={"purple"} text="Active" />

          <Button size="sm" variant="primary" disabled={true}>
            Save
          </Button>
          <Button variant="transparent" disabled={true}>
            Save
          </Button>
          <Button
            variant="outline"
            disabled={false}
            onClick={() => setAttendanceModal(!attendanceModal)}
          >
            Save
          </Button>
          <Button
            variant="primary"
            disabled={false}
            onClick={() => setIsChildSubModalOpen(!isChildSubModalOpen)}
          >
            Save
          </Button>
          <Button variant="transparent" disabled={false}>
            Save
          </Button>
          <Button
            variant="outline"
            disabled={false}
            onClick={() => setIsOpenSidebar(!isOpenSidebar)}
          >
            Save
          </Button>

          <LoginForm />

          <SidebarLink icon={Search} pageName={"Search"} link="/login" />

          <SidebarFooter
            name="Elena Miacheva"
            email="mmiacheva@yandex.ru"
            onClick={() => setIsOpen(!isOpen)}
          />

          <SidebarHeader onClose={() => setIsOpen(!isOpen)} />

          <Sidebar
            isOpen={isOpenSidebar}
            onExitButtonClick={() => setIsOpen(!isOpen)}
            onToggle={() => setIsOpenSidebar(!isOpenSidebar)}
            name={"Miacheva Lena"}
            email={"miacheva@yandex.ru"}
          />

          <ParentCard
            name={"Miacheva Elena"}
            email={"miacheva@yandex.ru"}
            phone={"89524442055"}
            onEdit={() => setIsOpen(!isOpen)}
            isEditMode={false}
          />
          <TeacherCard
            name={"Miacheva Elena"}
            email={"miacheva@yandex.ru"}
            phone={"89524442055"}
            clubs={"Музыкальная энциклопедия, музыкальные истории"}
            onEdit={() => setIsOpen(!isOpen)}
          />

          <ChildCard
            name={"Miacheva Lena"}
            birthDate={"30.04.2004"}
            isEditMode={false}
            onEdit={() => setIsOpen(!isOpen)}
            onWatchDetailed={() => setIsOpen(!isOpen)}
          />

          <ChildSubscriptionCard subDetails={sub} />

          <FamilyCard
            familyName={"Family"}
            parents={parents}
            children={children}
            onEdit={() => setIsOpen(!isOpen)}
            onWatchDetailed={() => setIsOpen(!isOpen)}
          />

          <ChildSubscriptionsModal
            subscriptions={subs}
            isOpen={isChildSubModalOpen}
            onClose={() => setIsChildSubModalOpen(!isChildSubModalOpen)}
          />

          <ClubCategoryCard
            clubCategory={clubCat}
            onEdit={() => setIsOpen(!isOpen)}
          />

          <ClubCard club={club} onEdit={() => setIsOpen(!isOpen)} />

          <ClubServiceCard
            clubService={service}
            onEdit={() => setIsOpen(!isOpen)}
          />

          <ScheduleCard record={schedule} onEdit={() => setIsOpen(!isOpen)} />

          <LessonCard
            lesson={lesson}
            onEdit={() => setIsOpen(!isOpen)}
            onMarkAttendance={() => setIsOpen(!isOpen)}
          />

          <SubscriptionCard
            subscription={sub}
            onClick={() => setIsOpen(!isOpen)}
            onWatchDetailed={() => setIsOpen(!isOpen)}
          />

          <PaymentCard payment={payment} onEdit={() => setIsOpen(!isOpen)} />

          <RequestCard
            request={request}
            onApprove={() => setIsOpen(!isOpen)}
            onReject={() => setIsOpen(!isOpen)}
          />

          <AttendanceRecord
            name={"Miacheva Lena"}
            isPresent={isPresent}
            onToggle={() => setIsPresent(!isPresent)}
          />

          <AttendanceModal
            lesson={lesson}
            attendance={attendance}
            onStatusChange={handleStatusChange}
            isOpen={attendanceModal}
            onClose={() => setAttendanceModal(!attendanceModal)}
          />

          <SubDetailed
            subscription={sub}
            service={service}
            payment={payment}
            isOpen={false}
          />

          <FamilyModal
            familyName={"Family"}
            parents={parents}
            children={children}
            isOpen={false}
          />

          <CreateFamilyModal parents={[]} children={children} isOpen={false} />

          <CreateParentModal isOpen={false} />

          <EditParentModal user={user} families={[]} isOpen={false} />

          <CreateChildModal isOpen={false} />

          <EditChildModal isOpen={false} child={child} families={[]} />

          <CreateTeacherModal isOpen={false} />

          <EditTeacherModal user={user} isOpen={false} />

          <CreateClubCatModal isOpen={false} />

          <EditClubCatModal category={cat} isOpen={false} />
        </div>
      </section>
    </>
  );
}

export default App;
