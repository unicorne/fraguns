-- Allow new question types: estimate, timeline, two_truths_one_lie
ALTER TABLE questions DROP CONSTRAINT questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('poll', 'text', 'scale', 'estimate', 'timeline', 'two_truths_one_lie'));

-- Votes table for two_truths_one_lie phase 2
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  target_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  voted_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, voter_id, target_member_id)
);

CREATE INDEX idx_votes_question ON votes(question_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON votes FOR ALL USING (true);
