var express = require('express');
var router = express.Router();
var path = require('path');
const UsuarioService = require('../services/UsuarioService');
var appRootDir = require('app-root-dir').get();
var UsuarioController = require(path.join(appRootDir, "controllers/UsuarioController"));
var CategoriaController = require(path.join(appRootDir, "controllers/CategoriaController"));
var PresupuestoController = require(path.join(appRootDir, "controllers/PresupuestoController"));
var middleware = require('./middleware');

// USUARIOS
router.post('/login', UsuarioController.login);
router.post('/recuperar', UsuarioController.recuperarCuenta);
router.post('/recuperar/reset', UsuarioController.resetearPassword);
router.get('/usuario', middleware.ensureAuthenticated, UsuarioController.getUsuarios);
router.post('/usuario', UsuarioController.postUsuarios);
router.put('/usuario/password', middleware.ensureAuthenticated, UsuarioController.putPassword);
router.post('/usuario/actualizar', middleware.ensureAuthenticated, UsuarioController.putUsuarios);
router.post('/usuario/eliminar', middleware.ensureAuthenticated, UsuarioController.deleteUsuarios); 


//CATEGORIAS DE USUARIOS
router.get('/categorias', middleware.ensureAuthenticated, CategoriaController.consultarCategorias);
router.post('/categorias', middleware.ensureAuthenticated, CategoriaController.crearCategoria);
router.put('/categorias', middleware.ensureAuthenticated, CategoriaController.editarCategoria);
router.delete('/categorias', middleware.ensureAuthenticated, CategoriaController.eliminarCategoria);

//PRESUPUESTOS
router.get('/presupuestos', middleware.ensureAuthenticated, PresupuestoController.consultarPresupuestos);
router.get('/presupuestos/divisas', PresupuestoController.consultarDivisas);
router.post('/presupuestos', middleware.ensureAuthenticated, PresupuestoController.crearPresupuesto);
router.post('/presupuestos/movimiento', middleware.ensureAuthenticated, PresupuestoController.crearMovimiento);
router.put('/presupuestos', middleware.ensureAuthenticated, PresupuestoController.editarPresupuesto);
router.delete('/presupuestos', middleware.ensureAuthenticated, PresupuestoController.eliminarPresupuesto);

module.exports = router;

