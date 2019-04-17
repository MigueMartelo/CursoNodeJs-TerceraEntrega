const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const CursoSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    unique: true
  },
  descripcion: {
    type: String
  },
  valor: {
    type: Number
  },
  modalidad: {
    type: String
  },
  intensidad: {
    type: Number
  },
  estado: {
    type: String,
    default: 'disponible'
  }
});

CursoSchema.plugin(uniqueValidator);

const Curso = mongoose.model('Curso', CursoSchema);

module.exports = Curso;