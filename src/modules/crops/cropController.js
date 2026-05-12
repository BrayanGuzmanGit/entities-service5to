const cropService = require('./cropService');
const ApiResponse = require('../../shared/ApiResponse');

class CropController {
  async addCrop(req, res, next) {
    try {
      const result = await cropService.registerCrop(req.body);
      return ApiResponse.success(res, result, 'Cultivo registrado', 201);
    } catch (err) { next(err); }
  }

  async addPest(req, res, next) {
    try {
      const result = await cropService.registerPest(req.body);
      return ApiResponse.success(res, result, 'Plaga registrada', 201);
    } catch (err) { next(err); }
  }

  async linkPest(req, res, next) {
    try {
      const { id_cultivo, id_plaga } = req.body;
      const result = await cropService.linkCropAndPest(id_cultivo, id_plaga);
      return ApiResponse.success(res, result, 'Plaga asociada exitosamente a cultivo', 201);
    } catch (err) { next(err); }
  }

  async getCultivos(req, res, next) {
    try {
      const result = await cropService.getCultivos();
      return ApiResponse.success(res, result, 'Cultivos obtenidos exitosamente', 200);
    } catch (err) {
      next(err);
    }
  }

  async getPlagasPorCultivo(req, res, next) {
    try {
      const { id_cultivo } = req.params;
      const result = await cropService.getPlagasPorCultivo(id_cultivo);
      return ApiResponse.success(res, result, 'Plagas obtenidas exitosamente', 200);
    } catch (err) {
      next(err);
    }
  }

}
  module.exports = new CropController();
