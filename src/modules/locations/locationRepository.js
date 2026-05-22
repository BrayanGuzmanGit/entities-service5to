const supabase = require('../../config/supabaseClient');
const AppError = require('../../shared/AppError');

class LocationRepository {

  // === Predios ===
  async createPredio(predioData) {
    const { data, error } = await supabase
      .from('predio')
      .insert([predioData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getPrediosByUser(userId) {
    const { data, error } = await supabase
      .from('predio')
      .select('*, municipio:id_municipio (nombre), lugar_produccion:id_lugar_produccion (nombre)')
      .eq('id_usuario_propietario', userId);

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getPredioById(idPredio) {
    const { data: predio, error: predioErr } = await supabase
      .from('predio')
      .select('*')
      .eq('id', idPredio)
      .single();

    if (predioErr || !predio) throw new AppError('Predio no encontrado', 404);

    return predio;
  }

  async linkLugarToPredio(idLugar, idPredio) {

    // 2. Actualizar el predio con la foránea del lugar
    const { data, error } = await supabase
      .from('predio')
      .update({ id_lugar_produccion: idLugar })
      .eq('id', idPredio)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async unlinkLugarFromPredio(id_predio) {
    const { data, error } = await supabase
      .from('predio')
      .update({ id_lugar_produccion: null })
      .eq('id', id_predio)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getPrediosByLugar(id_lugar_produccion) {
    const { data, error } = await supabase
      .from('predio')
      .select('*, municipio:id_municipio (nombre)')
      .eq('id_lugar_produccion', id_lugar_produccion);

    if (error) throw new AppError(error.message, 500);
    return data;
  }


  //Despues quitar el .eq('id_usuario_propietario', id_propietario)
  //y mejor validar que si es el dueño del predio en el service
  async editPredio(nombre, area, id_propietario, numeroRegistro) {
    const { data, error } = await supabase
      .from('predio')
      .update({ nombre, area }) //lo mismo que {nombre: nombre, area: area}
      .eq('id_usuario_propietario', id_propietario)
      .eq('numero_registro', numeroRegistro)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }


  async deletePredio(numeroRegistro) {
    const { data, error } = await supabase
      .from('predio')
      .delete()
      .eq('numero_registro', numeroRegistro)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }


  // === Lugares de Produccion ===
  async createLugarProduccion(lugarData) {
    const { data, error } = await supabase
      .from('lugar_produccion')
      .insert([lugarData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }


  async editNameLugar(numeroRegistro, nuevoNombre, id_productor) {
    const { data, error } = await supabase
      .from('lugar_produccion')
      .update({ nombre: nuevoNombre })
      .eq('numero_registro', numeroRegistro)
      .eq('uidproductor', id_productor)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async deleteLugar(numeroRegistro) {
    const { data, error } = await supabase
      .from('lugar_produccion')
      .delete()
      .eq('numero_registro', numeroRegistro)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getPredioByNumeroRegistro(numeroRegistro) {
    const { data, error } = await supabase
      .from('predio')
      .select('*')
      .eq('numero_registro', numeroRegistro)
      .single();

    if (error || !data) throw new AppError('Predio no encontrado', 404);
    return data;
  }

  async verificarSiTienePredioCentral(id_lugar_produccion) {
    const { data, error } = await supabase
      .from('predio')
      .select('id')
      .eq('id_lugar_produccion', id_lugar_produccion)
      .eq('es_central', true);

    // Si hay un error REAL de base de datos o conexión, haz que explote (arroja el error)
    if (error) {
      throw new AppError(error.message, 500);
    }

    // Como no usamos .single(), 'data' es un Array ([]).
    if (data.length === 0) {
      return [0]; // No hay predio central, devolvemos un array con un 0 para indicar eso.
    }

    const datos = [data.length, data[0].id];
    return datos;
  }

  async configurarPredioCentral(id_predio, is_central) {
    const { data, error } = await supabase
      .from('predio')
      .update({ es_central: is_central })
      .eq('id', id_predio)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getLugaresByProductor(id_productor) {
    const { data, error } = await supabase
      .from('lugar_produccion')
      .select('*')
      .eq('uidproductor', id_productor);

    if (error) throw new AppError(error.message, 500);

    const lugaresEnriquecidos = await Promise.all(
      data.map(async (lugar) => {
        // 1. Traemos TODOS los predios de este lugar (pedimos nombre, área y si es central)
        const { data: prediosAsociados } = await supabase
          .from('predio')
          .select('nombre, area, es_central')
          .eq('id_lugar_produccion', lugar.id);

        let areaTotal = 0;
        let predioCentral = null;

        // 2. Si encontró predios, los recorremos para sumar el área y encontrar el central
        if (prediosAsociados && prediosAsociados.length > 0) {
          prediosAsociados.forEach(predio => {
            // Sumamos el área (asegurándonos de que sea un número)
            areaTotal += Number(predio.area || 0);

            // Si este predio en particular es el central, lo guardamos
            if (predio.es_central) {
              predioCentral = { nombre: predio.nombre };
            }
          });
        }

        // 3. Devolvemos la caja original + el central + la nueva Área Total
        return {
          ...lugar,
          predioCentral: predioCentral || null,
          areaTotal: areaTotal
          //Modificar para que tambien traiga el area cultivada que es la suma del area de todos los lotes
        };
      })
    );

    return lugaresEnriquecidos;
  }

  async getLugarById(id_lugar) {
    console.log("Lugar encontrado en repository: " + id_lugar);
    const { data, error } = await supabase
      .from('lugar_produccion')
      .select('*')
      .eq('id', id_lugar)
      .single();

    if (error || !data) throw new AppError('Lugar de produccion no encontrado', 404);
    return data;
  }

  async getLugarByNumeroRegistro(numeroRegistro) {
    const { data, error } = await supabase
      .from('lugar_produccion')
      .select('*')
      .eq('numero_registro', numeroRegistro)
      .single();

    if (error || !data) throw new AppError('Lugar de produccion no encontrado', 404);
    return data;
  }


  //===DEPARTAMENTOS Y MUNICIPIOS===
  async getDepartamentos() {
    const { data, error } = await supabase
      .from('departamento')
      .select('*');

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getMunicipios() {
    const { data, error } = await supabase
      .from('municipio')
      .select('*');

    if (error) throw new AppError(error.message, 500);
    return data;
  }


  //===LOTES===
  async createLot(lotData) {
    const { data, error } = await supabase
      .from('lote')
      .insert([lotData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getLotesPorLugar(id_lugar) {
    const { data, error } = await supabase
      .from('lote')
      .select('*, cultivo:uidcultivo(nombre_comun)')//Traer tambien el nombre del cultivo
      .eq('uidlugarproduccion', id_lugar);

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getLotesById(id_lote) {
    const { data, error } = await supabase
      .from('lote')
      .select('*')
      .eq('id', id_lote)
      .single();

    if (error || !data) throw new AppError('Lote no encontrado', 404);
    return data;
  }

  async getLoteByNumero(numero_registro) {
    const { data, error } = await supabase
      .from('lote')
      .select('*')
      .eq('numero_registro', numero_registro)
      .single();

    if (error || !data) throw new AppError('Lote no encontrado', 404);
    return data;
  }

  async editLot(numeroRegistro, lote) {
    const { data, error } = await supabase
      .from('lote')
      .update({
        area: lote.area,
        cantidadproyectadarecoleccion: lote.cantidadproyectadarecoleccion,
        cantidad_recoleccion: lote.cantidad_recoleccion,
        cantidad_plantas: lote.cantidad_plantas,
        fecharecoleccion: lote.fecharecoleccion
      })
      .eq('numero_registro', numeroRegistro)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async deleteLot(numeroRegistro) {
    const { data, error } = await supabase
      .from('lote')
      .delete()
      .eq('numero_registro', numeroRegistro)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

}
module.exports = new LocationRepository();
