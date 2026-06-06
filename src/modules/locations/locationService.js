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


  async getPrediosByLugar(id_lugar) {
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

    //4. verificar que el predio no sea central
    if (predio.es_central === true) {
      throw new AppError('El predio es central, no se puede desvincular del lugar de produccion', 400);
    }

    //Traemos los lotes asociados al lugar de produccion
    const lotes = await locationRepository.getLotesPorLugar(predio.id_lugar_produccion);
    let areaCultivada = 0;
    lotes.forEach(lote => {
      areaCultivada = areaCultivada + Number(lote.area || 0);
    });

    const predios = await locationRepository.getPrediosByLugar(predio.id_lugar_produccion);
    let areaTotalLugar = 0;
    predios.forEach(predio => {
      areaTotalLugar = areaTotalLugar + Number(predio.area || 0);
    });

    //Verificar que el area cultivada no sea mayor al area que queda disponible al eliminar el predio del lugar
    if (areaCultivada > (areaTotalLugar - predio.area)) {
      throw new AppError('El predio no se puede desvincular del lugar de produccion porque el area cultivada es mayor al area disponible del lugar de produccion', 400);
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

  async verificarPredioCentral(id_lugar, id_user) {
    const lugar = await locationRepository.getLugarById(id_lugar);
    if (lugar.uidproductor !== id_user) {
      throw new AppError('No eres el dueño de este lugar de produccion', 403);
    }
    const lugarYaTieneCentral = await locationRepository.verificarSiTienePredioCentral(lugar.id);
    if (lugarYaTieneCentral[0] == 1) {// esto da true si el lugar ya tiene un predio central asignado, y false si no tiene.
      return true
    } else {
      return false
    }
  }

  async getMunicipioDelLugar(id_lugar){
    const predios = await locationRepository.getPrediosByLugar(id_lugar);
    let municipio = "";
    predios.forEach(predio => {
      if(predio.es_central===true){
        municipio=predio.id_municipio;
        return;
      }
    });
    if (municipio===""){
      throw new AppError("El lugar de produccion no tiene un predio central por lo tanto no hay municipio",400);
    }
    return municipio;
  }

  async getDireccionLugar(id_lugar) {
    const predios = await locationRepository.getPrediosByLugar(id_lugar);
    
    // Buscamos el predio central para saber la direccion del lugar 
    const predioCentral = predios.find(predio => predio.es_central === true);
    
    if (!predioCentral) {
      throw new AppError("El lugar de produccion no tiene un predio central por lo tanto no hay direccion", 400);
    }
    return {
        direccion: predioCentral.direccion,
        municipio: predioCentral.municipio.nombre
    }; 

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

    //4. Verificar propiedad 
    if (predio.id_lugar_produccion !== lugar.id) {
      throw new AppError('El predio no pertenece al lugar de produccion', 403);
    }

    //5. Verificar que el predio no sea central
    if (predio.es_central) {
      throw new AppError('El predio ya es central', 400);
    }

    const lugarYaTieneCentral = await locationRepository.verificarSiTienePredioCentral(lugar.id);
    if (lugarYaTieneCentral[0] == 1) {// esto da true si el lugar ya tiene un predio central asignado, y false si no tiene.
      await locationRepository.configurarPredioCentral(lugarYaTieneCentral[1], false); // Primero desmarcamos el predio central actual
      return await locationRepository.configurarPredioCentral(predio.id, true); //Se marca el nuevo predio como central
    } else {
      return await locationRepository.configurarPredioCentral(predio.id, true); // Si no hay predio central, simplemente marcamos el nuevo como central
    }
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

  async getLugaresByIds(ids_lugares){
    return await locationRepository.getLugaresByIds(ids_lugares);
  }
  
  async getLugarProduccionbyId(id_lugar) {
    return await locationRepository.getLugarById(id_lugar);
  }


  //===LOTES
  async registerLot(data, id_productor) {
    const { uidlugarproduccion, area } = data;
    console.log('Data que recibe el service:', data);

    // Validacion de que el lugar de produccion pertenezca al productor
    console.log('ID del lugar de produccion recibido en el service:', uidlugarproduccion);
    const lugar = await locationRepository.getLugarById(uidlugarproduccion);
    if (lugar.uidproductor !== id_productor) {
      throw new AppError('Solo el productor del lugar de produccion puede agregar lotes', 403);
    }

    //Validacion de que el area del lote no exceda el area total del lugar de produccion
    const predios = await locationRepository.getPrediosByLugar(uidlugarproduccion);
    let areaTotalLugar = 0;
    predios.forEach(predio => {
      areaTotalLugar = areaTotalLugar + Number(predio.area || 0);
    });

    let areaCultivada = 0;
    const lotes = await locationRepository.getLotesPorLugar(uidlugarproduccion);
    lotes.forEach(lote => {
      areaCultivada = areaCultivada + Number(lote.area || 0);
    });

    const areaDisponible = areaTotalLugar - areaCultivada;

    if (area > areaDisponible) {
      throw new AppError('El area del lote excede el area disponible del lugar de produccion: ' + areaDisponible, 400);
    }
    return await locationRepository.createLot(data);
  }


  async getLotesPorLugar(id_lugar) {
    return await locationRepository.getLotesPorLugar(id_lugar);
  }

  async editLot(numero_registro, lote, id_productor) {
    const lugar = await locationRepository.getLugarById(lote.uidlugarproduccion)
    if (lugar.uidproductor !== id_productor) {
      throw new AppError('Solo el productor del lugar de produccion puede editar el lote', 403);
    }

    const lotes = await locationRepository.getLotesPorLugar(lote.uidlugarproduccion);
    let areaCultivada = 0;
    lotes.forEach(lot => {
      areaCultivada = areaCultivada + Number(lot.area || 0);
    })

    const predios = await locationRepository.getPrediosByLugar(lote.uidlugarproduccion);
    let areaTotalLugar = 0;
    predios.forEach(predio => {
      areaTotalLugar = areaTotalLugar + Number(predio.area || 0);
    })

    const loteActual = await locationRepository.getLoteByNumero(numero_registro);

    const areaCultivadaRestante = areaCultivada - Number(loteActual.area);

    if ((areaCultivadaRestante + lote.area) > areaTotalLugar) {
      throw new AppError('El area disponible es: ' + (areaTotalLugar - areaCultivadaRestante) + 'por lo tanto el area: ' + lote.area + ' excede el limite y no se puede editar el lote.', 400);
    }
    
    if (loteActual.fechasiembra > lote.fecharecoleccion) {
      throw new AppError('La fecha de siembra: ' + lote.fechasiembra + ' no puede ser mayor a la fecha de recoleccion: ' + fecharecoleccion, 400);
    }
    

    return await locationRepository.editLot(numero_registro, lote);
  }

  async deleteLot(numero_registro, id_productor, id_lugar_produccion) {
    const lugar = await locationRepository.getLugarById(id_lugar_produccion)
    if (lugar.uidproductor !== id_productor) {
      throw new AppError('Solo el productor del lugar de produccion puede eliminar el lote', 403);
    }
    try {
      return await locationRepository.deleteLot(numero_registro);
    } catch (err) {
      throw new AppError(err.message, 400);
    }
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
