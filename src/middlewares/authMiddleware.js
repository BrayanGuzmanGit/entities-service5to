const userRepository = require('../modules/users/userRepository');
const AppError = require('../shared/AppError');


// Middleware para verificar el token JWT de Supabase
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó token. Acceso denegado.', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verifica el token contra Supabase Auth a través del Repository
    const authUser = await userRepository.verifyToken(token);
    console.log("authUser: ", authUser);
    console.log("------------------------------------------------------------")
    console.log("authHeader: ", authHeader);
    console.log("------------------------------------------------------------")
    console.log("req: ", req);
    console.log("------------------------------------------------------------")
    console.log("req.headers: ", req.headers);
    console.log("------------------------------------------------------------")

    // Attach user al request
    req.user = authUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para enforzar el Rol y que el estado sea 'Activo'
// Se pasa un array de roles permitidos, ej: roleMiddleware('Admin', 'Propietario')
const roleMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado en chequear rol.', 401);
      }

      // Consultar el perfil en BD para ver su estado y rol
      const usuario = await userRepository.findUserById(req.user.id);

      if (!usuario) {
        throw new AppError('No se encontró el perfil de usuario asociado en la base de datos.', 401);
      }

      // Validar Estado del usuario
      if (usuario.estado !== 'Activo') {
        throw new AppError(`Cuenta no habilitada. Estado actual: ${usuario.estado}. Contacte al Admin.`, 403);
      }

      
      // Validar Rol
      if (roles.length > 0 && !roles.includes(usuario.rol)) {
        throw new AppError(`Permisos insuficientes. Requiere: ${roles.join(' o ')}`, 403);
      }

      req.userProfile = usuario; // Para poder usar datos extra luego en controllers
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
