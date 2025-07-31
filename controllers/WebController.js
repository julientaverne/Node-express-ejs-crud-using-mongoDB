const Commune = require('../models/commune');

const get_index = async (req,res)=>{
   

   try {
      
      let result_communes = await Commune.find({ nom_standard: /colmar/i, annee: 2025 })
      .sort({code_insee : -1})
      .limit(10);

      let result_tpv = await Commune.find({ annee: 2025, population: { $lte: 500 } })
      .sort({population : -1})
      .limit(5);

      let nb_tpv = await Commune.countDocuments({ annee: 2025, population: { $lte: 500 } });

      let result_village = await Commune.find({ annee: 2025, population: { $gt: 500, $lte: 2000 } })
      .sort({population : -1})
      .limit(5);

      let nb_village = await Commune.countDocuments({ annee: 2025, population: { $gt: 500, $lte: 2000 } });

      //res.render('index',{title:'get_last_communes___index', menu_accordion:'accueil', communes : result_communes, communes_tpv: result_tpv, nb_communes_tpv: nb_tpv, communes_village: result_village, nb_communes_village: nb_village});
      res.render('index',{menu_accordion:'zones'});
  

    } catch (error) {
      console.log(error)
    }

}



module.exports = {
   get_index
}