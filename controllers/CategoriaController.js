var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var CategoriaService = require(path.join(appRootDir, "services/CategoriaService"));
var CategoriaController = {};

CategoriaController.consultarCategorias = async function (req, res) {
    let usuario = req.query.username;
    if (typeof usuario === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }

    let categorias = await CategoriaService.consultar(usuario);
    categorias = JSON.parse(JSON.stringify(categorias));

    if (categorias === "error") {
        res.status(400);
        res.json({
            error: "No se ha podido consultar las categorías. Inténtalo de nuevo más tarde."
        });
        return res;
    }
    res.status(200);
    res.json({
        data: {
            categorias: categorias
        }
    });
    return res;
}

CategoriaController.crearCategoria = async function (req, res) {
    let datos = req.body;
    if (typeof datos.username === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }else if (typeof datos.nombre === "undefined"){
        res.status(400);
        res.json({
            error: "Debes proporcionar un nombre"
        });
        return res;
    }

    let insercion = await CategoriaService.crearCategoria(datos);
    if (insercion !== "OK") {
        res.status(400);
        res.json({
            error: insercion
        });
        return res;
    }

    let categorias = await CategoriaService.consultar(datos.username);
    categorias = JSON.parse(JSON.stringify(categorias));

    res.status(200);
    res.json({
        data: {
            categorias: categorias
        }
    });
    return res;
}

CategoriaController.editarCategoria = async function (req, res) {
    let datos = req.body;
    if (typeof datos.username === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }else if (typeof datos.nombre === "undefined"){
        res.status(400);
        res.json({
            error: "Debes proporcionar un nombre"
        });
        return res;
    }

    let confirmacion = await CategoriaService.editarCategoria(datos);
    if (confirmacion  !== "OK") {
        res.status(400);
        res.json({
            error: "No se ha podido editar la categoría. Inténtalo de nuevo más tarde."
        });
        return res;
    }

    let categorias = await CategoriaService.consultar(datos.username);
    categorias = JSON.parse(JSON.stringify(categorias));

    res.status(200);
    res.json({
        data: {
            categorias: categorias
        }
    });
    return res;
}

CategoriaController.eliminarCategoria = async function (req, res) {
    let usuario = req.query.username;
    let nombre = req.query.nombre;
    if (typeof usuario === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }else if (typeof nombre === "undefined"){
        res.status(400);
        res.json({
            error: "Debes proporcionar un nombre"
        });
        return res;
    }

    let confirmacion = await CategoriaService.eliminarCategoria(usuario, nombre);
    if (confirmacion  !== "OK") {
        res.status(400);
        res.json({
            error: "No se ha podido eliminar la categoría. Inténtalo de nuevo más tarde."
        });
        return res;
    }

    let categorias = await CategoriaService.consultar(usuario);
    categorias = JSON.parse(JSON.stringify(categorias));

    res.status(200);
    res.json({
        data: {
            categorias: categorias
        }
    });
    return res;
}

module.exports = CategoriaController;