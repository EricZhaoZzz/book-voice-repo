-- Enable RLS on subscription tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies (admin only)
CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Classes policies (admin and class admin)
CREATE POLICY "Admins can manage all classes"
  ON classes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Class admins can read own classes"
  ON classes FOR SELECT
  USING (auth.uid() = admin_id);

CREATE POLICY "Class admins can update own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = admin_id);

-- Class students policies
CREATE POLICY "Admins can manage class students"
  ON class_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Class admins can manage their class students"
  ON class_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_students.class_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Students can read own class memberships"
  ON class_students FOR SELECT
  USING (auth.uid() = student_id);

-- Add validation constraints
ALTER TABLE subscriptions ADD CONSTRAINT check_date_range CHECK (end_date > start_date);
ALTER TABLE subscriptions ADD CONSTRAINT check_student_count CHECK (student_count >= 0);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
