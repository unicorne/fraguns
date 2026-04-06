-- Add team_split and ranking question types
ALTER TABLE questions DROP CONSTRAINT questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('poll', 'text', 'scale', 'estimate', 'timeline', 'two_truths_one_lie', 'team_split', 'ranking'));
