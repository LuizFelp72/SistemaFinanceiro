CREATE TABLE password_resets (
 token_hash CHAR(64) PRIMARY KEY,
 usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX password_resets_user ON password_resets(usuario_id);
