const locationService = require('./locationService');
const ApiResponse = require('../../shared/ApiResponse');

class LocationController {
  //===PREDIOS===
  async createPredio(req, res, next) {
    try {
      const predio = await locationService.registerPredio(req.body, req.user.id);
      return ApiResponse.success(res, predio, 'Predio creado existosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyPredios(req, res, next) {
    try {
      const { id_propietario } = req.params;
      const predios = await locationService.getMyPredios(id_propietario);
      return ApiResponse.success(res, predios, 'Predios obtenidos');
    } catch (error) {
      next(error);
    }
  }

  async linkLugarPredio(req, res, next) {
    try {
      const { numeroRegistro, id_predio } = req.body;
      const updatedPredio = await locationService.assignLugarToPredio(numeroRegistro, id_predio, req.user.id);
      return ApiResponse.success(res, updatedPredio, 'Lugar de Producción asignado al Predio exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getPrediosByLugar(req, res, next) {
    try {
      const { id_lugar } = req.params;
      const predios = await locationService.getPrediosByLugar(id_lugar);
      return ApiResponse.success(res, predios, 'Predios obtenidos');
    } catch (error) {
      next(error);
    }
  }

  async unlinkLugarPredio(req, res, next) {
    try {
      const { id_predio } = req.body;
      const updatedPredio = await locationService.unlinkLugarFromPredio(id_predio, req.user.id);
      return ApiResponse.success(res, updatedPredio, 'Lugar de Producción desvinculado del Predio exitosamente');
    } catch (err) {
      next(err);
    }
  }

  async editPredio(req, res, next) {
    try {
      const { numeroRegistro } = req.params;
      const { nombre, area } = req.body;
      const id_propietario = req.user.id;
      const updatedPredio = await locationService.editPredio(nombre, area, id_propietario, numeroRegistro);
      return ApiResponse.success(res, updatedPredio, 'Predio editado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deletePredio(req, res, next) {
    try {
      const { numeroRegistro } = req.params;
      const id_propietario = req.user.id;
      const deletedPredio = await locationService.deletePredio(numeroRegistro, id_propietario);
      return ApiResponse.success(res, deletedPredio, 'Predio eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }



  //===Lugares de produccion===
  async createLugarProduccion(req, res, next) {
    try {
      const lugar = await locationService.registerLugarProduccion(req.body, req.user.id);
      return ApiResponse.success(res, lugar, 'Lugar de Producción creado', 201);
    } catch (error) {
      next(error);
    }
  }


  async getMyLugares(req, res, next) {
    try {
      const { id_productor } = req.params;
      const lugares = await locationService.getMyLugares(id_productor);
      return ApiResponse.success(res, lugares, 'Lugares obtenidos');
    } catch (error) {
      next(error);
    }
  }

  async editNameLugar(req, res, next) {
    try {
      const { numeroRegistro } = req.params;
      const { nuevoNombre } = req.body;
      const id_productor = req.user.id;
      const updatedLugar = await locationService.editNameLugar(numeroRegistro, nuevoNombre, id_productor);
      return ApiResponse.success(res, updatedLugar, 'Lugar de Producción editado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deleteLugar(req, res, next) {
    try {
      const { numeroRegistro } = req.params;
      const id_productor = req.user.id;
      const deletedLugar = await locationService.deleteLugar(numeroRegistro, id_productor);
      return ApiResponse.success(res, deletedLugar, 'Lugar de Producción eliminado exitosamente');
    } catch (err) {
      next(err);
    }
  }

  async setPredioCentral(req, res, next) {
    try {
      const { numeroRegistroLugar } = req.body;
      const { numeroRegistroPredio } = req.body; //predio
      const updatedLugar = await locationService.setPredioCentral(numeroRegistroLugar, numeroRegistroPredio, req.user.id);
      return ApiResponse.success(res, updatedLugar, 'Predio central establecido exitosamente');
    } catch (err) {
      next(err);
    }
  }


  //===LOTES===
  async addLot(req, res, next) {
    try {
      const result = await locationService.registerLot(req.body, req.user.id);
      return ApiResponse.success(res, result, 'Lote registrado adecuadamente', 201);
    } catch (err) { next(err); }
  }

  async getLotesPorLugar(req, res, next) {
    try {
      const { id_lugar } = req.params;
      const lotes = await locationService.getLotesPorLugar(id_lugar);
      return ApiResponse.success(res, lotes, 'Lotes obtenidos');
    } catch (error) {
      next(error);
    }
  }



  //===Departamentos y municipios===
  async getDepartamentos(req, res, next) {
    try {
      const departamentos = await locationService.getDepartamentos();
      return ApiResponse.success(res, departamentos, 'Departamentos obtenidos');
    } catch (error) {
      next(error);
    }
  }
  async getMunicipios(req, res, next) {
    try {
      const municipios = await locationService.getMunicipios();
      return ApiResponse.success(res, municipios, 'Municipios obtenidos');
    } catch (error) {
      next(error);
    }
  }

}
module.exports = new LocationController();
