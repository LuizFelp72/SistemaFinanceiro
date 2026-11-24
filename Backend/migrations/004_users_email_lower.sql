-- O cadastro normaliza e-mails em minúsculas; o índice impede duplicidade que só difira na caixa.
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));
