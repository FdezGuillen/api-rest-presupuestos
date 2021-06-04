var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var CategoriaService = require(path.join(appRootDir, "services/CategoriaService"));
var CategoriaController = {};

/**Consulta categorías del usuario y devuelve respuesta */
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

/**Crea una categoría de un usuario y devuelve respuesta */
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

/**Recibe datos de una categoría, la actualiza y devuelve respuesta */
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

/**Recibe usuario y nombre de categoría, la elimina y devuelve respuesta */
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