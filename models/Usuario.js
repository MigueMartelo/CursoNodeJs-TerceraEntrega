const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  doc_identidad: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  rol: {
    type: String,
    required: true,
    trim: true,
    default: 'aspirante'
  },
  cursos: {
    type: Array,
    default: []
  }
});

UsuarioSchema.plugin(uniqueValidator);

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;