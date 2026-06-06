const express = require('express');
const router = express.Router();
const cropController = require('./cropController');
const { authMiddleware, roleMiddleware } = require('../../middlewares/authMiddleware');

const allowedRoles = ['Productor', 'Funcionario', 'Tecnico'];

//Ahorita no se usan esta tres
router.post('/cultivos', authMiddleware, roleMiddleware(...allowedRoles), cropController.addCrop);
router.post('/plagas', authMiddleware, roleMiddleware(...allowedRoles), cropController.addPest);
router.post('/cultivo-plaga', authMiddleware, roleMiddleware(...allowedRoles), cropController.linkPest);


//ver los cultivos registrados en la base de datos
router.get('/cultivos', authMiddleware, roleMiddleware(...allowedRoles), cropController.getCultivos);


//ver las plagas registradas en la base de datos por cultivo
router.get('/cultivo-plaga/:uidcultivo', authMiddleware, roleMiddleware(...allowedRoles),cropController.getPlagasPorCultivo);

module.exports = router;