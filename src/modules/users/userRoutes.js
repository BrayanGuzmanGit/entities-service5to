const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authMiddleware, roleMiddleware } = require('../../middlewares/authMiddleware');


// === Rutas Públicas ===
router.post('/register', userController.register);
router.post('/login', userController.login);

// === Rutas Protegidas (Solo Admin) ===
// Permite al admin listar usuarios congelados y cambiar su estado
router.get('/pending', authMiddleware, roleMiddleware('Funcionario'), userController.listPending);
router.patch('/:cc/status', authMiddleware, roleMiddleware('Funcionario'), userController.changeUserStatus);
router.get('/me', authMiddleware, userController.getProfile);
router.get('/all', authMiddleware, roleMiddleware('Funcionario'), userController.getAllActiveUsers);
router.get('/tecnicos/:idMunicipio', authMiddleware, roleMiddleware('Funcionario'), userController.getTecnicosByMunicipio); //tecnicos por municipio
router.get('/:id', authMiddleware, userController.getUserById);

// === Rutas Protegidas (Usuarios activos) ===
router.patch('/editProfile', authMiddleware, userController.editProfile);

module.exports = router;    
