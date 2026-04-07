const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Intentando signIn...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'chvmix79@gmail.com',
    password: '3809304Cris'
  });

  if (error) {
    console.error('Auth Error:', error);
    return;
  }
  
  console.log('Login success:', data.user.id);
  
  const { data: empresa, error: empError } = await supabase
            .from("empresas")
            .select("*")
            .eq("email", "chvmix79@gmail.com")
            .single();
            
  if (empError) {
    console.error('Empresa Error:', empError);
    return;
  }
  
  console.log('Empresa:', empresa.id);
}
test();
