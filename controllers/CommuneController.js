const Commune = require('../models/commune');

const get_last_communes = async (req,res)=>{
   /*
   Commune.find(
      { nom_standard: /colmar/i, annee: 2025 }
   )
   .sort({code_insee : -1})
   .limit(10)
   .then((result)=>{
      //res.json({title:'get_last_communes',communes : result});
      res.render('index',{title:'get_last_communes___index', communes : result});
   })
   .catch((err)=>{
      console.log(err);
   });
   */


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

      res.render('index3',{title:'get_last_communes___index', communes : result_communes, communes_tpv: result_tpv, nb_communes_tpv: nb_tpv, communes_village: result_village, nb_communes_village: nb_village});
  
    } catch (error) {
      console.log(error)
    }

}

const get_details = async (req,res)=>{
   try {
      const cp = req.params.cp;
      const nom = req.params.nom;

      let result = await Commune.findOne({ nom_standard: nom, annee: 2025, code_postal: cp })

      res.render('commune_details',{title:'get_commune_details', commune: result});
  
    } catch (error) {
      console.log(error)
    }

}

/*
const blog_index = (req,res)=>{
    Blog.find()
    .sort({createdAt : -1})
    .then((result)=>{
       res.render('index',{title:'home',blogs : result});
    })
    .catch((err)=>{
       console.log(err);
    });

}

const single_blog = (req,res)=>{
    const id = req.params.id;
    Blog.findById(id)
    .then((result)=>{
       res.render('blogs/single-blog',{blog : result, title: 'Single BLog'});
    })
    .catch((err)=>{
       console.log(err);
    })
 }

const get_create_blog = (req,res)=>{
    res.render('blogs/create',{title:'Add Blog'});
}

const add_blog = (req,res)=>{
    const blog = new Blog(req.body);
    blog.save()
    .then((result)=>{
       res.redirect('/');
    })
    .catch((err)=>{
       console.log(err)
    });
 }

const get_blog_update =  (req,res)=>{
   const id = req.params.id;
   Blog.findById(id)
   .then((result)=>{
      res.render('blogs/edit-blog',{blog : result, title: 'Update BLog'});
   })
   .catch((err)=>{
      console.log(err);
   })
}

const update_blog = (req, res) => {
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, (error)=> {
     if(error) {
       res.redirect('/')
     }else{
       res.redirect('/')
     }
   })
 }

const delete_blog = (req,res)=>{
    const id = req.params.id;
    Blog.findByIdAndDelete(id)
    .then((result)=>{
       res.json({redirect : '/'})
    })
    .catch((err)=>{
       console.log(err);
    })
 }
 */

module.exports = {
   get_last_communes,
   get_details
   /*
    blog_index,
    single_blog,
    get_create_blog,
    add_blog,
    get_blog_update,
    update_blog,
    delete_blog
    */
}