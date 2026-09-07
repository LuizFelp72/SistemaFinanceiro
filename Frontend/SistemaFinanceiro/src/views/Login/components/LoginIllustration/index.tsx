import { Typography } from "@mui/material";
import { RightPanel, ImageWrapper, IllustrationImage, Eyebrow } from "./styles";
import loginImage from "./assets/pricipalLoginImage.png";

function LoginIllustration() {
  return (
    <RightPanel>
      <ImageWrapper>
        <IllustrationImage src={loginImage} alt="Ilustração de login" />
      </ImageWrapper>

      <Typography sx={{ fontWeight: "bold" }} variant="h5">
        A melhor experiência para organizar sua vida financeira.
      </Typography>

      <Eyebrow>Controle total do seu dinheiro, num só lugar.</Eyebrow>
    </RightPanel>
  );
}

export default LoginIllustration;
