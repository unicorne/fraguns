CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comments_question ON comments(question_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON comments FOR ALL USING (true);
