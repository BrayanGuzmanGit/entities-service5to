const userRepository = require('./userRepository');
const AppError = require('../../shared/AppError');


class UserService {
  async signUp(userData) {
    //Verificamos que la cc no este ya en la base de datos
    const existingUser = await userRepository.findUserByCC(userData.cc);

    if (existingUser) throw new AppError('El usuario ya existe', 409);

    // 1. Crear usuario en Supabase Auth (delegado al Repository)
    const authUser = await userRepository.authSignUp(
      userData.correo_electronico,
      userData.clave
    );

    // 2. Limpiar datos: Si el usuario NO es técnico, forzamos que su tarjeta sea nula
    if (userData.rol !== "Tecnico") {
      userData.tarjeta_profesional = null;
    }

    if (userData.rol == "Tecnico" && userData.tarjeta_profesional == null) {
      throw new AppError('El usuario no puede ser asistente tecnico sin tarjeta profesional', 409);
    }
    // 3. Insertar perfil en tabla `usuarios` con el UUID del Auth
    try {
      const userBody = {
        cc: userData.cc,
        nombre: userData.nombre,
        apellido: userData.apellido,
        direccion_residencia: userData.direccion_residencia,
        telefono: userData.telefono,
        correo_electronico: userData.correo_electronico,
        clave: userData.clave,
        tarjeta_profesional: userData.tarjeta_profesional,
        rol: userData.rol,
        id_municipio: userData.id_municipio,
        estado: 'Pendiente', // Regla de negocio: todo usuario nuevo empieza Pendiente
      };
      return await userRepository.createUser(authUser.id, userBody);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  async login(email, password, rol) {
    // 1. Verificar credenciales contra Supabase Auth (delegado al Repository)
    const authData = await userRepository.authSignIn(email, password, rol);
    // authData = { session: { access_token, ... }, user: { id, email } }

    // 2. Buscar el perfil local del usuario
    const localUser = await userRepository.findUserById(authData.user.id);
    if (!localUser) {
      throw new AppError('Usuario autenticado pero su perfil no existe en BD.', 404);
    }

    // 3. Reglas de negocio: verificar estado de la cuenta
    if (localUser.estado === 'Eliminado') {
      throw new AppError('Tu cuenta ha sido eliminada por el administrador.', 403);
    }
    
    if (localUser.estado !== 'Activo') {
      throw new AppError(
        `Tu perfil aún no ha sido aprobado. Estado actual: ${localUser.estado}`,
        403
      );

    }
    if (localUser.rol !== rol) {
      throw new AppError('Usuario no encontrado', 403);
    }

    return {
      session: authData.session,
      user: localUser,
    };
  }

  async getPendingUsers() {
    return await userRepository.getPendingUsers();
  }

  async approveUser(cc, status) {
    // Regla de negocio: solo estos dos estados son válidos como destino
    const allowedStates = ['Activo', 'Eliminado'];
    if (!allowedStates.includes(status)) {
      throw new AppError('Acción inválida. El estado debe ser "Activo" o "Eliminado"', 400);
    }
    return await userRepository.updateEstado(cc, status);
  }

  

  async editProfile(id, nombre, direccion, apellido, telefono, email, password, token) {
    // Obtener usuario actual para comparar cambios reales
    const usuarioActual = await userRepository.findUserById(id);
    // Solo actualizar Auth si email o password REALMENTE cambiaron
    const emailCambio = email && email.trim() && email !== usuarioActual.correo_electronico;
    const passwordCambio = password && password.trim() && password !== usuarioActual.clave;
    
    if (passwordCambio) {
      await userRepository.updateClave(password, token);
    }else{
      password = usuarioActual.clave; // Mantener la clave actual si no se cambia
    }
    if (emailCambio) {
      await userRepository.updateEmail(email, token);
    }else{
      email = usuarioActual.correo_electronico; // Mantener el email actual si no se cambia
    }

    const updatedUser = await userRepository.updateProfile(
      id,
      nombre,
      direccion,
      apellido,
      telefono,
      email,
      password
    );

    if (!updatedUser) {
      throw new AppError('No se pudo actualizar el perfil', 500);
    }
    return updatedUser;
  }
}

module.exports = new UserService();
