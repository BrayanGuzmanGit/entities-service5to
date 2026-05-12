const express = require('express');
const router = express.Router();
const locationController = require('./locationController');
const { authMiddleware, roleMiddleware } = require('../../middlewares/authMiddleware');


// === Rutas de Predios ===
router.post('/predios', authMiddleware, roleMiddleware('Propietario'), locationController.createPredio);
router.get('/predios/:id_propietario', authMiddleware, roleMiddleware('Propietario'), locationController.getMyPredios);
router.patch('/predios/link', authMiddleware, roleMiddleware('Propietario'), locationController.linkLugarPredio);  // ← PRIMERO
router.patch('/predios/:numeroRegistro', authMiddleware, roleMiddleware('Propietario'), locationController.editPredio);  // ← DESPUÉS
router.patch('/predio/unlink', authMiddleware, roleMiddleware('Propietario'), locationController.unlinkLugarPredio);
router.delete('/predio/delete/:numeroRegistro', authMiddleware, roleMiddleware('Propietario'), locationController.deletePredio);


// === Rutas de Lugares de Producción ===
router.post('/lugares', authMiddleware, roleMiddleware('Productor'), locationController.createLugarProduccion);
router.patch('/lugares/predioCentral', authMiddleware, roleMiddleware('Productor'), locationController.setPredioCentral);
router.get('/lugares/:id_productor', authMiddleware, roleMiddleware('Productor'), locationController.getMyLugares);
router.patch('/lugares/:numeroRegistro', authMiddleware, roleMiddleware('Productor'), locationController.editNameLugar);
router.get('/lugares/:id_lugar/predios', authMiddleware, roleMiddleware('Productor'), locationController.getPrediosByLugar);
router.delete('/lugares/delete/:numeroRegistro', authMiddleware, roleMiddleware('Productor'), locationController.deleteLugar);

// === Ruta para listar lotes por lugar de produccion
router.get('/lotes/:id_lugar', authMiddleware, roleMiddleware('Productor'), locationController.getLotesPorLugar);


// Ruta creacion de lote (solo para productor)
router.post('/lotes', authMiddleware, roleMiddleware('Productor'), locationController.addLot);

// === Rutas de departamentos y municipio (publicas)
router.get('/departamentos', locationController.getDepartamentos);
router.get('/municipios', locationController.getMunicipios);

module.exports = router;
