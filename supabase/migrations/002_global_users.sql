-- Global users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add user_id to members
ALTER TABLE members ADD COLUMN user_id uuid REFERENCES users(id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);

-- Index
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_members_user ON members(user_id);
