import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,

  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Form } from "./styles.ts";

interface LoginFormData {
  nome?: string;
  email: string;
  password: string;
}

interface LoginFormProps {
  creating: boolean;
  onSubmit: (data: LoginFormData) => Promise<void>;
  error: string;
}

function LoginForm({ onSubmit, error, creating }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}

      {creating && <TextField label="Nome" autoComplete="name" fullWidth error={!!errors.nome} helperText={errors.nome?.message} {...register("nome", { validate: v => !!v?.trim() || "Informe seu nome" })} />}
      <TextField
        type="email"
        autoComplete="email"
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
        autoComplete={creating ? "new-password" : "current-password"}
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
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
        {...register("password", { required: "Senha é obrigatória", minLength: creating ? { value: 8, message: "Use pelo menos 8 caracteres" } : undefined })}
      />

      <Button disabled={isSubmitting} type="submit" variant="contained" fullWidth size="large">
        {isSubmitting ? "Aguarde…" : creating ? "Criar conta" : "Entrar"}
      </Button>
    </Form>
  );
}

export default LoginForm;