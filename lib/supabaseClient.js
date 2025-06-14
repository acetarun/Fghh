import { createClient } from '@supabase/supabase-js';

const supabaseUrl = https://kmpykklrccjvlgukcoqp.supabase.co;
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcHlra2xyY2NqdmxndWtjb3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDk4OTcsImV4cCI6MjA2MTUyNTg5N30.O-NuWlyZ5GKvJf4FyJSSh5R0WSc-otnPV8xHR8WKbpI;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);