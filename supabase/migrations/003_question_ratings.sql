CREATE TABLE question_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, member_id)
);

ALTER TABLE question_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON question_ratings FOR ALL USING (true);
CREATE INDEX idx_ratings_question ON question_ratings(question_id);
