const { z } = require('zod');
const AppError = require('../../shared/AppError');

// 1. ESQUEMAS DE ZOD (Viven fuera de la clase por eficiencia de memoria)
const registerSchema = z.object({
  email: z.string().email('El formato del correo es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  apellido: z.string().min(3, 'Los apellidos deben tener al menos 3 caracteres'),
  cc: z.string().min(5, 'La cédula debe ser válida'),
  telefono: z.string().min(7, 'El telefono debe tener al menos 7 caracteres'),
  id_municipio: z.number().optional(),
  rol: z.enum(['Admin', 'Productor', 'Asistente Tecnico', 'Propietario'], {
    errorMap: () => ({ message: 'Rol inválido' })
  }),
  tarjeta_profesional: z.string().optional()
});

const editProfileSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').optional(), // Cambiado a 'apellido' en singular para coincidir con tu controller
  direccion: z.string().optional(), // Agregado por tu controller
  telefono: z.string().optional(),
  email: z.string().email('Correo inválido').optional(), // Agregado por tu controller
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional() // Agregado por tu controller
});



class UserValidator {
  validateRegister(req, res, next) {
    try {
      req.body = registerSchema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        return next(new AppError(`Error de validación: ${errorMessages}`, 400));
      }
      next(error);
    }
  }

  // Middleware para Edición de Perfil
  validateEditProfile(req, res, next) {
    try {
      req.body = editProfileSchema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        return next(new AppError(`Error de validación: ${errorMessages}`, 400));
      }
      next(error);
    }
  }
  
}

module.exports = new UserValidator();