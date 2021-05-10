var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var PresupuestoService = require(path.join(appRootDir, "services/PresupuestoService"));
var PresupuestoController = {};

PresupuestoController.consultarPresupuestos = async function (req, res) {
    let usuario = req.query.username;
    if (typeof usuario === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }

    let presupuestos;
    if (typeof req.query.id !== "undefined"){
        presupuestos = await PresupuestoService.consultarPorId(req.query.id);
    }else{
        presupuestos = await PresupuestoService.consultar(usuario);
    }

    presupuestos = JSON.parse(JSON.stringify(presupuestos));

    if (presupuestos === "error") {
        res.status(400);
        res.json({
            error: "No se ha podido consultar los presupuestos. Inténtalo de nuevo más tarde."
        });
        return res;
    }
    res.status(200);
    res.json({
        data: {
            presupuestos: presupuestos
        }
    });
    return res;
}

PresupuestoController.crearPresupuesto = async function (req, res) {
    let datos = req.body;
    if (typeof datos.username === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }

    let insercion = await PresupuestoService.crearPresupuesto(datos);
    if (insercion !== "OK") {
        res.status(400);
        res.json({
            error: insercion
        });
        return res;
    }

    let presupuestos = await PresupuestoService.consultar(datos.username);
    presupuestos = JSON.parse(JSON.stringify(presupuestos));

    res.status(200);
    res.json({
        data: {
            presupuestos: presupuestos
        }
    });
    return res;
}

PresupuestoController.editarPresupuesto = async function (req, res) {
    let datos = req.body;
    if (typeof datos.username === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }else if (typeof datos.id === "undefined"){
        res.status(400);
        res.json({
            error: "Debes proporcionar un id de presupuesto"
        });
        return res;
    }

    let confirmacion = await PresupuestoService.editarPresupuesto(datos);
    if (confirmacion  !== "OK") {
        res.status(400);
        res.json({
            error: "No se ha podido editar el presupuesto. Inténtalo de nuevo más tarde."
        });
        return res;
    }

    let presupuesto = await PresupuestoService.consultarPorId(datos._id);

    res.status(200);
    res.json({
        data: {
            presupuesto: presupuesto
        }
    });
    return res;
}

PresupuestoController.eliminarPresupuesto = async function (req, res) {
    let usuario = req.query.username;
    let id = req.query.id;
    if (typeof usuario === "undefined") {
        res.status(400);
        res.json({
            error: "Debes proporcionar un usuario"
        });
        return res;
    }else if (typeof id === "undefined"){
        res.status(400);
        res.json({
            error: "Debes proporcionar un id"
        });
        return res;
    }

    let confirmacion = await PresupuestoService.eliminarPresupuesto(id);
    if (confirmacion  !== "OK") {
        res.status(400);
        res.json({
            error: "No se ha podido eliminar el presupuesto. Inténtalo de nuevo más tarde."
        });
        return res;
    }

    let presupuestos = await PresupuestoService.consultar(usuario);
    presupuestos = JSON.parse(JSON.stringify(presupuestos));

    res.status(200);
    res.json({
        data: {
            presupuestos: presupuestos
        }
    });
    return res;
}

PresupuestoController.consultarDivisas = async function (req, res) {
    let divisas = await PresupuestoService.consultarDivisas();

    if (divisas === "error") {
        res.status(400);
        res.json({
            error: "No se ha podido cargar la página. Inténtalo de nuevo más tarde."
        });
        return res;
    }
    res.status(200);
    res.json({
        data: {
            divisas: divisas
        }
    });
    return res;
}

module.exports = PresupuestoController;