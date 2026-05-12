const locationRepository = require('./locationRepository');
const AppError = require('../../shared/AppError');

class LocationService {
  async registerPredio(dataPredio, propietarioId) {
    try {
      const predioData = {
        //el id se generara automaticamente en la base de datos
        //el numero de registro sera un codigo unico generado por el sistema de 6 digitos empezando por el 000001
        nombre: dataPredio.nombre,
        area: dataPredio.area,
        direccion: dataPredio.direccion,
        es_central: dataPredio.es_central,
        id_municipio: dataPredio.id_municipio,
        id_usuario_propietario: propietarioId,
        id_lugar_produccion: null
      };
      return await locationRepository.createPredio(predioData);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  async getMyPredios(ownerId) {
    return await locationRepository.getPrediosByUser(ownerId);
  }

  async assignLugarToPredio(numeroRegistro, id_predio, ownerId) {
    // 1. Traer informacion del predio desde la base de datos (Responsabilidad del Repo)
    const predio = await locationRepository.getPredioById(id_predio);

    // 2. Lógica de Negocio: Verificar propiedad (Responsabilidad del Service)
    if (predio.id_usuario_propietario !== ownerId) {
      throw new AppError('Solo el propietario del predio puede vincular un lugar de produccion', 403);
    }
    
    // 3. Obtener el id del lugar de produccion por numero de registro
    const lugar = await locationRepository.getLugarByNumeroRegistro(numeroRegistro);

    //verificar que el predio no tenga un lugar asociado ya
    if (predio.id_lugar_produccion !== null) {
      throw new AppError('El predio ya tiene un lugar de produccion asignado, debe desvincularlo para asignar otro', 400);
    }
    // 4. Enlazar (Responsabilidad del Repo)
    return await locationRepository.linkLugarToPredio(lugar.id, id_predio);
  }


  async getPrediosByLugar(id_lugar){
    return await locationRepository.getPrediosByLugar(id_lugar);
  }


  async unlinkLugarFromPredio(id_predio, ownerId) {
    //1. Traer info del predio desde la base de datos
    const predio = await locationRepository.getPredioById(id_predio);

    //2. Lógica de Negocio: Verificar propiedad (Responsabilidad del Service)
    if (predio.id_usuario_propietario !== ownerId) {
      throw new AppError('Solo el propietario del predio puede desvincular un lugar de produccion', 403);
    }
    //3. verificar que el predio tenga un lugar de produccion asignado
    if (predio.id_lugar_produccion === null) {
      throw new AppError('El predio no tiene un lugar de produccion asignado', 400);
    }

    if (predio.es_central === true) {
      throw new AppError('El predio es central, no se puede desvincular del lugar de produccion', 400);
    }
    //4. Desvincular (Responsabilidad del Repo)
    return await locationRepository.unlinkLugarFromPredio(id_predio);
  }

  

  async editPredio(nombre, area, id_propietario, numeroRegistro) {
    return await locationRepository.editPredio(nombre, area, id_propietario, numeroRegistro);
  }

  async deletePredio(numeroRegistro, ownerId) {
    //1. Traer info del predio desde la base de datos
    const predio = await locationRepository.getPredioByNumeroRegistro(numeroRegistro);
    
    //2. Lógica de Negocio: Verificar propiedad (Responsabilidad del Service)
    if (predio.id_usuario_propietario !== ownerId) {
      throw new AppError('Solo el propietario del predio puede eliminarlo', 403);
    }
    //3. verificar que el predio tenga un lugar de produccion asignado
    if (predio.id_lugar_produccion !== null) {
      throw new AppError('El predio tiene un lugar de produccion asignado, debe desvincularlo para eliminarlo', 400);
    }
    //4. Eliminar el predio
    return await locationRepository.deletePredio(numeroRegistro);
  }


  //===Lugares de produccion===
  async registerLugarProduccion(dataLugar, producerId) {
    try {
      const lugarBody = {
        //el id se genera automaticamente en supabase
        //el numero de registro sera un codigo unico generado por el sistema de 6 digitos empezando por el 000001
        nombre: dataLugar.nombre,
        uidproductor: producerId
      };
      return await locationRepository.createLugarProduccion(lugarBody);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  async editNameLugar(numeroRegistro, nuevoNombre, id_productor) {
    //verificar que el lugar pertenezca e ese productor
    return await locationRepository.editNameLugar(numeroRegistro, nuevoNombre, id_productor);
  }

  async setPredioCentral(numeroRegistroLugar, numeroRegistroPredio, id_productor) {
    //1. Traer info del lugar de produccion desde la base de datos
    const lugar = await locationRepository.getLugarByNumeroRegistro(numeroRegistroLugar);

    //2. Lógica de Negocio: Verificar propiedad (Responsabilidad del Service)
    if (lugar.uidproductor !== id_productor) {
      throw new AppError('Solo el productor del lugar de produccion puede establecer un predio central', 403);
    }

    //3. Traer info del predio desde la base de datos
    const predio = await locationRepository.getPredioByNumeroRegistro(numeroRegistroPredio);

    //4. Lógica de Negocio: Verificar propiedad (Responsabilidad del Service)
    if (predio.id_lugar_produccion !== lugar.id) {
      throw new AppError('El predio no pertenece al lugar de produccion', 403);
    }

    //5. Verificar que el predio no sea central
    if (predio.es_central) {
      throw new AppError('El predio ya es central', 400);
    }

    const lugarYaTieneCentral = await locationRepository.verificarSiTienePredioCentral(lugar.id);

    if (lugarYaTieneCentral) {
      throw new AppError('Este lugar de producción ya tiene un predio central. Solo se permite uno.', 400);
    }

    //6. Establecer el predio central
    return await locationRepository.setPredioCentral(predio.id);
  }

  async deleteLugar(numeroRegistro, ownerId) {
    //1. Traer info del lugar de produccion desde la base de datos
    const lugar = await locationRepository.getLugarByNumeroRegistro(numeroRegistro);

    //2.Verificar propiedad (Responsabilidad del Service)
    if (lugar.uidproductor !== ownerId) {
      throw new AppError('Solo el productor del lugar de produccion puede eliminarlo', 403);
    }
    //3. verificar que el lugar de produccion no tenga predios asociados
    const predios = await locationRepository.getPrediosByLugar(lugar.id);
    if (predios.length > 0) {
      throw new AppError('El lugar de produccion tiene predios asociados, debe desvincularlos para eliminarlo', 400);
    }
    
    //AQUI IRA LA FUNCION DE getLotesPorLugar para verificar que el lugar no tenga Lotes asociados

    //4. Eliminar el lugar de produccion
    return await locationRepository.deleteLugar(numeroRegistro);
  }

  async getMyLugares(id_productor) {
    return await locationRepository.getLugaresByProductor(id_productor);
  }


  //===LOTES
  async registerLot(data) {
    // Si necesitas validar que el lugar de produccion pertenezca al productor,
    // se podría hacer una consulta extra al 'locationRepository'. 
    // Por simplicidad y eficiencia de MVP, registramos el dato proveniente del request.
    return await locationRepository.createLot(data);
  }

  async getLotesPorLugar(id_lugar) {
    return await locationRepository.getLotesPorLugar(id_lugar);
  }


  //===Departamentos y municipios===
  async getDepartamentos() {
    return await locationRepository.getDepartamentos();
  }

  async getMunicipios() {
    return await locationRepository.getMunicipios();
  }

}
module.exports = new LocationService();
