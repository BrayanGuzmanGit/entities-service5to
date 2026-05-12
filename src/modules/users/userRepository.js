const supabase = require('../../config/supabaseClient');
const AppError = require('../../shared/AppError');

class UserRepository {
  // =============================================
  // CAPA DE AUTH (Supabase Auth)
  // =============================================
  async authSignUp(email, password) {
    const { data, error } = await supabase.auth.signUp(
      { email, password }
    );
    if (error) throw new AppError(`Error Auth: ${error.message}`, 400);
    if (!data.user) throw new AppError('No se pudo crear el usuario en Auth.', 500);
    return data.user; // Devuelve el user de Auth (contiene .id, .email)
  }

  async authSignIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AppError(`Error de Login: ${error.message}`, 401);
    return data; // Devuelve { session, user } de Supabase Auth
  }

  async verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError('Token inválido o expirado', 401);
    }
    //Se devuelve si sale todo bien
    return data.user;
  }

  // =============================================
  // CAPA DE BASE DE DATOS (tabla `usuarios`)
  // =============================================
  async createUser(userId, userData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ id: userId, ...userData }])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async findUserById(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    // Si no lo encuentra, devuelve un codigo especifico PGRST116 (not found)
    if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);
    return data;
  }

  async findUserByCC(cc) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, cc, correo_electronico') // Solo lo que necesitamos ver
      .eq('cc', cc)
      .single();
    // PGRST116 = "no encontró nada", eso está bien → retorna null
    if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);
    return data; // null si no existe, objeto si sí existe
  }


  async updateEstado(cc, estado) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado })
      .eq('cc', cc)
      .select()
      .single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getPendingUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        municipio:id_municipio (nombre)
      `)
      .eq('estado', 'Pendiente');

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async updateEmail(email, token) {
    const { data, error } = await supabase.auth.updateUser(
    {email},
    { token }
  );
  if (error) {
    console.error('❌ Error en Auth.updateUser:', error);
    throw new AppError(error.message, 400);
  }
  return data;
  }

  async updateClave(password, token) {
  const { data, error } = await supabase.auth.updateUser(
    { password },
    { token }
  );
  if (error) {
    console.error('❌ Error en Auth.updateUser:', error);
    throw new AppError(error.message, 400);
  }

  return data;
}

  async updateProfile(id, nombre, direccion_residencia, apellido, telefono, correo_electronico, clave) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ nombre, direccion_residencia, apellido, telefono, correo_electronico, clave })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }


}

module.exports = new UserRepository();
