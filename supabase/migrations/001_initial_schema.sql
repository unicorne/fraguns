-- FragUns Database Schema

-- Groups
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Members (no auth, just names)
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  push_subscription jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, name)
);

-- Questions
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('poll', 'text', 'scale')),
  text text NOT NULL,
  config jsonb DEFAULT '{}',
  scheduled_date date,
  is_active boolean DEFAULT false,
  deadline timestamptz,
  created_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now()
);

-- Answers
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, member_id)
);

-- Indexes for common queries
CREATE INDEX idx_members_group ON members(group_id);
CREATE INDEX idx_questions_group ON questions(group_id);
CREATE INDEX idx_questions_active ON questions(group_id, is_active) WHERE is_active = true;
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_groups_invite ON groups(invite_code);

-- Disable RLS (all access goes through API routes)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (API routes use service role key)
CREATE POLICY "Service role full access" ON groups FOR ALL USING (true);
CREATE POLICY "Service role full access" ON members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON questions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON answers FOR ALL USING (true);
