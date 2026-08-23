import { createClient } from '@supabase/supabase-js';

// Initialize database client — must point at the LIVE project ref.
// (The previous ref was decommissioned and returned `project_deleted` on every request.)
const supabaseUrl = 'https://ckglrlfftiijdoumozzo.databasepad.com';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjAzMjcwOTZlLTVjNDgtNDFmMS05NzcyLWJlMTdlOWVkNmZjZiJ9.eyJwcm9qZWN0SWQiOiJja2dscmxmZnRpaWpkb3Vtb3p6byIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg3NDcxNjkyLCJleHAiOjIxMDI4MzE2OTIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.VG2UB2b7JYYph3DyN6D7qPg4-OwEUz4AG4abvb4vBFA';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
