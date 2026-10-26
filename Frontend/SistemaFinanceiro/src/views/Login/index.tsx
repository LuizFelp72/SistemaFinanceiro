import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { useAuth } from "../../auth/AuthContext";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";
import { Container, LeftPanel, FormWrapper } from "./styles";

function Login() {
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

function handleLogin(data: { email: string; password: string }) {
  const success = login(data.email, data.password);

  if (success) {
    navigate("/");
  } else {
    setError("E-mail ou senha inválidos");
  }
}

  return (
    <Container>
      <LeftPanel>
        <FormWrapper>
          <Typography variant="h4" gutterBottom>
            Faça seu login
          </Typography>
          <LoginForm onSubmit={handleLogin} error={error} />
        </FormWrapper>
      </LeftPanel>
      <LoginIllustration />
    </Container>
  );
}

export default Login;
