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

/** Callback de inicio de sesión */
UsuarioController.login = async function (req, res) {
    // Obtiene los datos 
    let usuario = await UsuarioService.login(req.body.correo_electronico, req.body.password);
    usuario = JSON.parse(JSON.stringify(usuario));
    
    //Gestión de errores
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

    //Genera un accessToken
    usuario["accessToken"] = TokenService.createToken(usuario);

    //Quita la contraseña del objeto antes de devolverla
    delete(usuario["password"]);

    //Devuelve respuesta con los datos
    res.status(200);
    res.json({
        usuario: usuario,
    });
    return res;
}

/**Inicia el proceso para cambiar contraseña olvidada. Envía un email con la ruta usando enviarEmail.js */
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

/**Recibe una respuesta, la actualiza, elimina el token de recuperación y devuelve respuesta */
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

/**Responde con los datos de un usuario según su username */
UsuarioController.getUsuarios = async function (req, res) {

    let usuarios;
    if (typeof req.query.username !== "undefined") {
        usuarios = await UsuarioService.consultarPorUsername(req.query.username);
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

/**Registra un usuario */
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
                    error: "Ya existe un usuario con username " + insercion.keyValue['username'] 
                    + ". Elige otro username"
                });
            } else if (insercion.keyPattern['correo_electronico'] === 1) {
                res.json({
                    error: "Ya existe un usuario con correo electrónico " 
                    + insercion.keyValue['correo_electronico'] 
                    + ". Elige otro correo electrónico"
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

/**Actualiza datos de un usuario */
UsuarioController.putUsuarios = async function (req, res) {
    let usuario = req.body;
    let file = req.files;

    //Reduce la imagen recibida y la convierte a base64
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

/**Actualiza contraseña si la contraseña antigua proporcionada es correcta */
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

/**Elimina un usuario */
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