import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Form, OptionsRow } from "./styles.ts";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  error: string;
}

function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="E-mail"
        placeholder="seuemail@email.com"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        {...register("email", { required: "E-mail é obrigatório" })}
      />

      <TextField
        label="Senha"
        placeholder="sua senha"
        type={showPassword ? "text" : "password"}
        fullWidth
        error={!!errors.password}
        helperText={errors.password?.message}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...register("password", { required: "Senha é obrigatória" })}
      />

      <OptionsRow>
        <Link href="#" variant="body2">
          Esqueci minha senha
        </Link>
      </OptionsRow>

      <Button type="submit" variant="contained" fullWidth size="large">
        Entrar
      </Button>
    </Form>
  );
}

export default LoginForm;