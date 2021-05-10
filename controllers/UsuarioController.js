var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var UsuarioService = require(path.join(appRootDir, "services/UsuarioService"));
var ImageService = require(path.join(appRootDir, "utils/ImageService"));
var TokenService = require(path.join(appRootDir, "services/TokenService"));
var CategoriaService = require(path.join(appRootDir, "services/CategoriaService"));
var UsuarioController = {};
const enviarEmail = require("../utils/email/enviarEmail");
const multer = require('multer')
const upload = multer({
    dest: 'uploads/'
})

UsuarioController.login = async function (req, res) {
    let usuario = await UsuarioService.login(req.body.correo_electronico, req.body.password);
    usuario = JSON.parse(JSON.stringify(usuario));
    usuario["accessToken"] = TokenService.createToken(usuario);
    if (usuario == "error") {
        res.status(400);
        res.json({
            error: "No se pudo iniciar sesión. Por favor, inténtalo más tarde."
        });
        return res;
    } else if (usuario == "Contraseña incorrecta") {
        res.status(400);
        res.json({
            error: "Contraseña incorrecta"
        });
        return res;
    } else if (usuario == "Datos de inicio de sesión incorrectos") {
        res.status(400);
        res.json({
            error: "Datos de inicio de sesión incorrectos"
        });
        return res;
    }
    delete(usuario["password"]);
    res.status(200);
    res.json({
        usuario: usuario,
    });
    return res;
}

UsuarioController.recuperarCuenta = async function (req, res) {
    let datosRecuperacion = await UsuarioService.recuperarCuenta(req.body.correo_electronico);
    if (datosRecuperacion == "error") {
        res.status(400);
        res.json({
            error: "ERROR"
        });
        return res;
    }

    await enviarEmail(datosRecuperacion.correo_electronico, "Reiniciar contraseña", {
            name: datosRecuperacion.username,
            link: datosRecuperacion.link,
        },
        "./templates/recuperarCuenta.handlebars"
    );

    res.status(200);
    res.json({
        mensaje: "Te hemos enviado un e-mail a tu cuenta de correo electrónico con los pasos para recuperar tu cuenta."
    });
    return res;
}

UsuarioController.resetearPassword = async function (req, res) {
    let resultado = await UsuarioService.resetearPassword(req.body.user_id, req.body.token, req.body.password);
    if (resultado !== true) {
        res.status(400);
        res.json({
            error: "ERROR"
        });
        return res;
    }

    res.status(200);
    res.json({
        mensaje: "Contraseña reseteada correctamente"
    });
    return res;
}

UsuarioController.getUsuarios = async function (req, res) {

    let usuarios;
    if (typeof req.query.username !== "undefined") {
        usuarios = await UsuarioService.consultarPorUsername(req.query.username);
    } else {
        usuarios = await UsuarioService.consultar();
    }

    if (usuarios == "error") {
        res.status(400);
        res.json({
            error: "Datos incorrectos. Por favor, vuelve a intentarlo."
        });
        return res;
    }

    res.status(200);
    res.json({
        data: usuarios
    });
    return res;
}

UsuarioController.postUsuarios = async function (req, res) {

    let usuario = req.body;
    let insercion = await UsuarioService.registrar(usuario);

    //Gestión de errores
    if (typeof insercion.name !== "undefined" && insercion.name === "MongoError") {
        res.status(400);

        //Si algunos de los campos únicos ya existen
        if (insercion.code === 11000) {
            if (insercion.keyPattern['username'] === 1) {
                res.json({
                    error: "Ya existe un usuario con username " + insercion.keyValue['username'] + ". Elige otro username"
                });
            } else if (insercion.keyPattern['correo_electronico'] === 1) {
                res.json({
                    error: "Ya existe un usuario con correo electrónico " + insercion.keyValue['correo_electronico'] + ". Elige otro correo electrónico"
                });
            }
        } else {
            res.json({
                error: "No se ha podido completar el registro. Por favor, vuelve a intentarlo más tarde."
            });
        }

        return res;
    }

    res.status(201);
    res.json({
        data: {
            mensaje: "Usuario registrado correctamente."
        }
    });
    return res;
}

UsuarioController.putUsuarios = async function (req, res) {
    let usuario = req.body;
    let file = req.files;
    if (file.length == 1) {
        let imagen = await ImageService.reducirImagen(file[0].buffer);
        usuario["imagen_perfil"] = imagen.toString('base64');
    }

    let actualizacion = await UsuarioService.editar(usuario);

    if (actualizacion == "error") {
        res.status(400);
        res.json({
            error: "ERROR"
        });
        return res;
    }
    delete(usuario["password"]);
    res.status(200);
    res.json({
        data: {
            mensaje: "Datos actualizados correctamente",
            usuario: JSON.parse(JSON.stringify(actualizacion))
        }
    });
    return res;
}

UsuarioController.putPassword = async function (req, res) {
    let datos = req.body;
    if (typeof datos.password_nueva === "undefined" || datos.password_nueva.trim() === ""){
        if (actualizacion == "error") {
            res.status(404);
            res.json({
                error: "Introduce una contraseña nueva"
            });
            return res;
        }
    }
    let actualizacion = await UsuarioService.editarPassword(datos);

    if (actualizacion == "error" || actualizacion === "Contraseña incorrecta") {
        res.status(400);
        res.json({
            error: actualizacion
        });
        return res;
    }
    delete(usuario["password"]);
    res.status(200);
    res.json({
        data: {
            mensaje: "Contraseña actualizada correctamente",
            usuario: JSON.parse(JSON.stringify(actualizacion))
        }
    });
    return res;
}

UsuarioController.deleteUsuarios = async function (req, res) {
    let usuario = req.body;
    let eliminacion = await UsuarioService.eliminar(usuario);

    if (eliminacion === "error" || eliminacion === "Contraseña incorrecta") {
        res.status(400);
        res.json({
            error: eliminacion
        });
        return res;
    }
    res.status(200);
    res.json({
        data: {
            mensaje: "Usuario eliminado"
        }
    });
    return res;
}

module.exports = UsuarioController;