require('dotenv').config();
module.exports = {
  // Puerto: lee PORT de .env, si no existe usa 3000
  PORT: process.env.PORT || 3001,
  // Supabase: lee las variables críticas de .env
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};
