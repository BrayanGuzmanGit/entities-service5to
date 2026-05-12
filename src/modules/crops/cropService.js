const cropRepository = require('./cropRepository');
//luego llamar a AppError
class CropService {
  async registerCrop(data) {
    // Aquí puedes incluir reglas de validación adicionales
    return await cropRepository.createCrop(data);
  }

  async registerPest(data) {
    return await cropRepository.createPest(data);
  }

  async linkCropAndPest(idCultivo, idPest) {
    return await cropRepository.linkCropPest(idCultivo, idPest);
  }

  async getCultivos() {
    return await cropRepository.getCultivos();
  }

  async getPlagasPorCultivo(idCultivo) {
    return await cropRepository.getPlagasPorCultivo(idCultivo);
  }
}
module.exports = new CropService();
