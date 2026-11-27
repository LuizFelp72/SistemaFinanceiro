import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Content } from "./styles";

function MainLayout() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Sidebar />
      <Content id="conteudo" tabIndex={-1}>
        <Outlet />
      </Content>
    </>
  );
}

export default MainLayout;
