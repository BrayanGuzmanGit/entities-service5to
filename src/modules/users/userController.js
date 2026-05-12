const userService = require('./userService');
const ApiResponse = require('../../shared/ApiResponse');

class UserController {
  async register(req, res, next) {
    try {
      //El JSON que envio el front es: {email, password, nombre, apellido, telefono, id_municipio, rol}
      const userData = req.body;

      //Se le envia al servicio
      const result = await userService.signUp(userData);
      
      //Si todo sale bien, se le responde al cliente asi
      return ApiResponse.success(res, result, 'Usuario registrado con éxito. Por favor espera la aprobación del Admin.', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, rol } = req.body;
      if (!email || !password || !rol) return ApiResponse.error(res, 'Faltan credenciales', 400);

      const result = await userService.login(email, password, rol);
      return ApiResponse.success(res, result, 'Login exitoso');
    } catch (error) {
      next(error);
    }
  }

  async listPending(req, res, next) {
    try {
      const users = await userService.getPendingUsers();
      return ApiResponse.success(res, users, 'Usuarios pendientes recuperados');
    } catch (error) {
      next(error);
    }
  }

  async changeUserStatus(req, res, next) {
    try {
      const { cc } = req.params;
      const { estado } = req.body; // 'Activo' o 'Eliminado'

      const updatedUser = await userService.approveUser(cc, estado);
      return ApiResponse.success(res, updatedUser, `El estado del usuario se actualizó a ${estado}`);
    } catch (error) {
      next(error);
    }
  }
  async editProfile(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const { nombre, direccion, apellido, telefono, email, password } = req.body;
      const updatedUser = await userService.editProfile(
        req.user.id,
        nombre,
        direccion,
        apellido,
        telefono,
        email,
        password,
        token
      );
      return ApiResponse.success(res, updatedUser, 'Perfil actualizado con éxito');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
