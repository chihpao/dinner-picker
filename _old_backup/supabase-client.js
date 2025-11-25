// 簡易 Supabase 初始化（共用給記帳頁與列表頁）
const SUPABASE_URL = 'https://ypszjizmmvoyxgkcvmzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwc3pqaXptbXZveXhna2N2bXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTk2ODgsImV4cCI6MjA3OTE5NTY4OH0.z1nhCLgUs1OBQgAR6OTW_Xnq_I_v99im7e_E9dLkOUc';
const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
