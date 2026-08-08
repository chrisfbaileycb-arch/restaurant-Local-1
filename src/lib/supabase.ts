import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://wnsqwqbihpkghzcqzntg.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImEzNzIwM2FjLTY0ODAtNDU0MC1hOGE3LTMxNjcwYjk4MWI5YyJ9.eyJwcm9qZWN0SWQiOiJ3bnNxd3FiaWhwa2doemNxem50ZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2MTkzMTU2LCJleHAiOjIxMDE1NTMxNTYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.h2Leb4HNsk3m0b5tznmr4hi7cAio3bA-QFjVs8Y7pHI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };