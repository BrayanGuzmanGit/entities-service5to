const supabase = require('../../config/supabaseClient');
const AppError = require('../../shared/AppError');

class CropRepository {
  // === Cultivo ===
  async createCrop(cropData) {
    const { data, error } = await supabase
      .from('cultivo')
      .insert([cropData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getCultivos() {
    const { data, error } = await supabase
      .from('cultivo')
      .select('*');

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  // === Plaga ===
  async createPest(pestData) {
    const { data, error } = await supabase
      .from('plaga')
      .insert([pestData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async getPlagasPorCultivo(id_cultivo) {
    const { data, error } = await supabase
      .from('cultivo_plaga')
      .select('*')
      .eq('id_cultivo', id_cultivo);

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  // === Asociación Cultivo-Plaga ===
  async linkCropPest(id_cultivo, id_plaga) {
    const { data, error } = await supabase
      .from('cultivo_plaga')
      .insert([{ id_cultivo, id_plaga }])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }




  // === Lote ===

}
module.exports = new CropRepository();
