const express = require('express');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var session = require('express-session')
var MemoryStore = require('memorystore')(session)

const app = express();

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: 'keyboard cat'
}));

require('./helpers');

mongoose.connect('mongodb+srv://cursonodetdea:tdea1234@terceraentrega-mvzn1.mongodb.net/cursos?retryWrites=true', { useNewUrlParser: true }, (err, res) => {
  if (err) console.log('Error: ', err);
  else console.log('Conectado correctamente!');
});

// Models
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');

const dirNode_modules = path.join(__dirname, '../node_modules');
const dirPartials = path.join(__dirname, '../partials');
hbs.registerPartials(dirPartials);
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

app.set('view engine', 'hbs');

app.use((req, res, next) => {
  if (req.session.usuario) {
    res.locals.session = true;
    if (req.session.rol === 'aspirante') {
      res.locals.aspirante = 'aspirante';
    } else {
      res.locals.coordinador = 'coordinador';
    }
  }

  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/registrar', (req, res) => {
  res.render('registrar', { titulo: 'Registrar usuario' });
})

app.post('/registrar', (req, res) => {
  let usuario = new Usuario({
    doc_identidad: req.body.doc_identidad,
    password: bcrypt.hashSync(req.body.password, 10),
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono,
    rol: req.body.rol
  });

  Usuario.find({ 'doc_identidad': req.body.doc_identidad }, (err, usuarioDB) => {
    if (err) console.log(error);

    if (usuarioDB.length >= 1) {
      console.log(usuarioDB);
      res.render('registrar', { titulo: 'Registrar usuario', mensaje: 'Documento de identidad ya registrado', });
    } else {
      usuario.save();
      res.render('registrar', { titulo: 'Registrar usuario', mensaje: 'Usuario registrado exitosamente' });
    }
  });
});

app.post('/ingresar', (req, res) => {
  Usuario.findOne({ doc_identidad: req.body.doc_identidad }, (err, usuario) => {
    if (err) {
      console.log(err);
    }

    if (!usuario) {
      return res.render('index', {
        mensaje: 'Usuario o contraseña invalidos'
      });
    }

    if (!bcrypt.compareSync(req.body.password, usuario.password)) {
      return res.render('index', {
        mensaje: 'Usuario o contraseña invalidos'
      });
    }

    req.session.usuario = usuario._id;
    req.session.rol = usuario.rol;

    res.render('index', {
      mensaje: `Bienvenido ${usuario.nombre}`
    });
  });
});

app.get('/salir', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
  });

  res.redirect('/');
});

app.get('/cursos', (req, res) => {
  Curso.find({}).exec((err, cursos) => {
    if (err) console.log(err);

    res.render('cursos', { titulo: "Listado de cursos", cursos });
  });
});

app.get('/crearcurso', (req, res) => {
  res.render('crearcurso', { titulo: "Crear Curso" });
});

app.post('/crearcurso', (req, res) => {
  const cursoNuevo = new Curso({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    valor: req.body.valor,
    modalidad: req.body.modalidad,
    intensidad: req.body.intensidad,
    estado: req.body.estado
  });
  cursoNuevo.save();

  res.redirect('cursos');
});

app.get('/cursosdisponibles', (req, res) => {
  Curso.find({ estado: 'disponible' }).exec((err, cursosDisponibles) => {
    if (err) console.log(err);

    res.render('cursosdisponibles', { titulo: 'Cursos Disponibles para Inscripción', cursosDisponibles });
  });
});

app.post('/cambiarestado', (req, res) => {
  Curso.findById(req.body.cursoId, (err, curso) => {
    if (err) console.log(err);

    if (curso.estado === 'disponible') {
      curso.estado = 'cerrado';
    } else {
      curso.estado = 'disponible';
    }

    curso.save();

    res.redirect('cursos');
  })
});

app.get('/inscribir', (req, res) => {
  Usuario.findById(req.session.usuario, (err, usuario) => {
    if (err) console.log(err);

    Curso.find({ estado: 'disponible' }).exec((err, cursosDisponibles) => {
      if (err) console.log(err);

      res.render('inscribir', {
        titulo: 'Inscribir a Curso',
        cursosDisponibles,
        doc_identidad: usuario.doc_identidad,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono
      });
    });
  });
});

app.post('/inscribir', (req, res) => {

  Usuario.findById(req.session.usuario, (err, usuario) => {
    if (err) console.log(err);

    cursosInscritos = usuario.cursos.filter(curso => curso === req.body.nombre_curso);

    if (cursosInscritos.length === 0) {
      usuario.cursos.push(req.body.nombre_curso);
      usuario.save();
      res.render('index', { mensaje: 'Usuario inscrito correctamente' });
    } else {
      Curso.find({ estado: 'disponible' }).exec((err, cursosDisponibles) => {
        if (err) console.log(err);

        res.render('inscribir', {
          titulo: 'Inscribir a Curso',
          cursosDisponibles,
          doc_identidad: usuario.doc_identidad,
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          mensaje: 'No te puedes inscribir dos veces en un mismo curso'
        });
      });
    }
  });
});


app.get('/inscritos', (req, res) => {
  Usuario.find().exec((err, usuarios) => {
    if (err) console.log(err);

    res.render('inscritos', { titulo: "Usuarios Inscritos", usuarios });
  });
});

app.post('/eliminar', (req, res) => {
  Usuario.findById(req.body.userId, (err, usuario) => {
    if (err) console.log(err);

    nuevosCursos = usuario.cursos.filter(curso => curso !== req.body.nombre_curso);

    usuario.cursos = nuevosCursos;

    usuario.save();

    res.redirect('inscritos');
  });
});

const PORT = process.env.PORT || 4500;

app.listen(PORT, () => {
  console.log('Server on port ', PORT);
});