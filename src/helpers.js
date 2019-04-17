const hbs = require('hbs');

const fs = require('fs');

hbs.registerHelper('listarCursos', (cursos) => {

  let texto = `<table class="table table-bordered table-striped">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Modalidad</th>
                    <th scope="col">Intensidad</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
              `;

  if (cursos.length === 0) {
    texto += `</tbody></table>`;
    texto += `<p class="alert alert-warning">No hay cursos disponibles</p>`;
  } else {
    cursos.forEach(curso => {
      texto += `<tr>
                  <td>${curso.nombre}</td>
                  <td>${curso.descripcion}</td>
                  <td>$${curso.valor}</td>
                  <td>${curso.modalidad}</td>
                  <td>${curso.intensidad}</td>
                  <td>
                    ${curso.estado} 
                    <form class="form-inline" action="/cambiarestado" method="post">
                      <div class="form-group">
                        <button type="submit" class="btn btn-warning" name="cursoId" value=${curso._id}>
                          Cambiar Estado
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>`
    });

    texto += `</tbody></table>`;
  }

  return texto;
});

hbs.registerHelper('cursosDisponibles', (cursosDisponibles) => {

  let texto = '';

  if (cursosDisponibles.length === 0) {
    texto = `<p class="alert alert-warning">No hay cursos disponibles para inscripción actualmente</p>`;
    return texto;
  } else {

    cursosDisponibles.forEach(curso => {

      texto += `<div class="col-md-4 mb-2">
                  <div class="card">
                    <h5 class="card-header">${curso.nombre}</h5>
                    <div class="card-body">
                      <p class="card-title text-muted">Valor: $${curso.valor}</p>
                      <p class="card-text">Descipción: ${curso.descripcion}</p>
                      <button class="btn btn-secondary btn-block" data-toggle="modal" data-target="#modal_${curso.id}">Ver más</button>
                    </div>
                  </div>
                </div>
                <div class="modal fade" id="modal_${curso.id}" tabindex="-1" role="dialog" aria-labelledby="modalLabel${curso.id}" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel${curso.id}">${curso.nombre}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">
                        <p>Descripición: ${curso.descripcion}</p>
                        <p>Modalidad: ${curso.modalidad}</p>
                        <p>Duración: ${curso.intensidad} horas </p>
                        <h6>Valor: $${curso.valor}</h6>
                      </div>
                      <div class="modal-footer">
                        <a href="/inscribir" class="btn btn-success">Inscribir</a>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                      </div>
                    </div>
                  </div>
                </div>`
        ;
    });
    return texto;
  }
});

hbs.registerHelper('cursosInscribir', (cursosDisponibles) => {

  let texto = '';

  cursosDisponibles.forEach(curso => {
    texto += `<option value="${curso.nombre}">${curso.nombre}</option>`;
  });

  return texto;
});

hbs.registerHelper('listarInscritos', (usuarios) => {

  let texto = `<table class="table table-bordered table-striped">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Identificación</th>
                    <th scope="col">Email</th>
                    <th scope="col">Teléfono</th>
                    <th scope="col">Curso</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
              `;

  if (usuarios.length === 0) {
    texto += `</tbody></table>`;
    texto += `<p class="alert alert-warning">No hay Usuarios inscritos</p>`;
  } else {
    usuarios.forEach(usuario => {
      usuario.cursos.forEach(curso => {
        texto += `<tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.doc_identidad}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefono}</td>
                    <td>${curso}</td>
                    <td>
                      <form class="form-inline" action="/eliminar" method="POST">
                        <input type="hidden" name="userId" value="${usuario._id}" />
                        <div class="form-group">                        
                          <button type="submit" class="btn btn-danger" name="nombre_curso" value="${curso}">
                            Eliminar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>`
      });
    });
    texto += `</tbody></table>`;
  }

  return texto;
});