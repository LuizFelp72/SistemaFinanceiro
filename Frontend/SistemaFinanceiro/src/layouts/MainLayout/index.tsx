import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Content } from "./styles";

function MainLayout() {
  return (
    <>
      <Sidebar />
      <Content>
        <Outlet />
      </Content>
    </>
  );
}

export default MainLayout;
