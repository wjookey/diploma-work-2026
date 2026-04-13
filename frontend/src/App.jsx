import { useState } from "react";
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
import { Search } from "lucide-react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(true);

  const array = [1, 2, 3, 4, 5];

  return (
    <>
      <section id="center">
        <div>
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
          <Button variant="outline" disabled={true}>
            Save
          </Button>
          <Button variant="primary" disabled={false}>
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
          />
          <TeacherCard
            name={"Miacheva Elena"}
            email={"miacheva@yandex.ru"}
            phone={"89524442055"}
            clubs={"Музыкальная энциклопедия, музыкальные истории"}
            onEdit={() => setIsOpen(!isOpen)}
          />
        </div>
      </section>
    </>
  );
}

export default App;
