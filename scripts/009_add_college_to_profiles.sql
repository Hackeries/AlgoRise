-- Add college_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
ALTER TABLE group_memberships 
ADD CONSTRAINT check_college_match 
CHECK (
  CASE 
    WHEN (SELECT g.type FROM groups g WHERE g.id = group_id) = 'college' THEN
      (SELECT p.college_id FROM profiles p WHERE p.id = user_id) = (SELECT g.college_id FROM groups g WHERE g.id = group_id)
    ELSE true 
  END
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_college ON group_memberships(group_id) WHERE (SELECT g.type FROM groups g WHERE g.id = group_id) = 'college';