import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Using SERVICE_ROLE_KEY to bypass RLS for backend ingestion pipelines
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY
);
