const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communeSchema = new Schema({
    nom_standard :{
        type : String,
        required : true
    },
    gentile :{
        type : String,
        required : true
    },
    code_insee :{
        type : String,
        required : true
    },
    code_postal :{
        type : Number,
        required : true
    },
    blason :{
        type : String,
        required : true
    },
    annee :{
        type : Number,
        required : true
    },
    population :{
        type : Number,
        required : true
    },
    dep_nom :{
        type : String,
        required : true
    },
    dep_code :{
        type : String,
        required : true
    },
    presentation :{
        type : String,
        required : true
    }
}, {timestamps:true});

const Commune = mongoose.model('Commune', communeSchema);
module.exports = Commune;