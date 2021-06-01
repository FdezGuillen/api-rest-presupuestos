var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
var Usuario = require(path.join(appRootDir, "Models")).Usuario;
var TokenRecuperacion = require(path.join(appRootDir, "Models")).TokenRecuperacion;
dotenv.config();
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

var UsuarioService = {

    /**Recibe un email y contraseña, devuelve los datos de ese usuario */
    login(email, password) {

        //Consulta si el usuario con ese email existe
        return Usuario.findOne({
            correo_electronico: email,
        }).then((usuario) => {

            // Compara la contraseña recibida con la que esta guardada. Puesto que la contraseña 
            // que se recibe no está encriptada y la que está en la base de datos sí, se
            // compara con bcrypt.compare
            return bcrypt.compare(password, usuario.password).then((esValido) => {
                if (esValido !== true) {
                    throw new Error("Contraseña incorrecta");
                }

                //Devuelve datos del usuario
                return usuario;
            })
        }).catch((err) => {
            if (typeof err.message !== "undefined" && err.message === "Contraseña incorrecta") {
                return err.message;
            } else if (err.message !== "undefined") {
                return "Datos de inicio de sesión incorrectos";
            }
            return "error";
        })
    },

    /**Recibe un email y permite recuperar su cuenta */
    recuperarCuenta: async function (email) {
        try {
            // Obtiene los datos del usuario
            let usuario = await Usuario.findOne({
                correo_electronico: email,
            });

            // Comprueba si existe un token de recuperación anterior, de ser así,
            // lo elimina
            let token = TokenRecuperacion.findOne({
                user_id: usuario._id
            })
            await token.deleteOne();

            // Genera un token encriptado que permitirá a quien lo reciba resetear
            // la contraseña de la cuenta
            let resetToken = crypto.randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

            // Guarda el token en la base de datos para poder comprobarlo más tarde
            await new TokenRecuperacion({
                user_id: usuario._id,
                token: hash,
                createdAt: Date.now(),
            }).save();

            //Con el token, se genera un string con la url de recuperación de la contraseña
            const link = `${clientURL}/passwordReset?token=${resetToken}&id=${usuario._id}`;

            // Se devuelven los datos
            return {
                correo_electronico: usuario.correo_electronico,
                username: usuario.username,
                link: link
            };
        } catch (err) {
            return "error";
        }

    },

    resetearPassword: async function (userId, token, password) {
        try {
            let tokenRecuperacion = await TokenRecuperacion.findOne({
                user_id: userId
            });
            if (!tokenRecuperacion) {
                throw new Error("El token no es válido o ha expirado");
            }
            const esValido = await bcrypt.compare(token, tokenRecuperacion.token);
            if (!esValido) {
                throw new Error("El token no es válido o ha expirado");
            }
            const hash = await bcrypt.hash(password, Number(bcryptSalt));
            await Usuario.updateOne({
                _id: userId
            }, {
                $set: {
                    password: hash
                }
            }, {
                new: true
            });

            await tokenRecuperacion.deleteOne();
            return true;
        } catch (err) {
            return "error";
        }

    },

    consultar() {
        return Usuario.find({}).then((items) => {
            return items;
        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    consultarPorUsername(username) {
        return Usuario.find({
            username: username
        }).then((items) => {
            return items;
        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    /**Recibe datos de usuario y devuelve una promesa que se completará 
     * al insertar en bbdd */
    registrar(usuario) {
        let nuevoUsuario = new Usuario(usuario);
        return nuevoUsuario.save().then((usuarioCreado) => {
                return usuarioCreado;
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
    },

    editar(usuario) {
        return Usuario.findOne({
            username: usuario.username,
        }).then((usuarioEncontrado) => {
            return bcrypt.compare(usuario.password, usuarioEncontrado.password).then((esValido) => {
                if (esValido !== true) {
                    throw new Error("Contraseña incorrecta");
                }
                usuario.password = usuarioEncontrado.password;
                return Usuario.findOneAndUpdate({
                    username: usuario.username,
                }, usuario).then((actualizacion) => {
                    return actualizacion;
                }).catch((err) => {
                    console.log(err);
                    return "error";
                });
            })
        }).catch((err) => {
            if (typeof err.message !== "undefined" && err.message === "Contraseña incorrecta") {
                return err.message;
            } else if (err.message !== "undefined") {
                return "Datos de inicio de sesión incorrectos";
            }
            return "error";
        })
    },

    editarPassword(usuario) {
        return Usuario.findOne({
            username: usuario.username,
        }).then((usuarioEncontrado) => {
            return bcrypt.compare(usuario.password, usuarioEncontrado.password).then((esValido) => {
                if (esValido !== true) {
                    throw new Error("Contraseña incorrecta");
                }
                return Usuario.findOneAndUpdate({
                    username: usuario.username,
                }, {
                    $set: {
                        password: hash
                    }
                }).then((actualizacion) => {
                    return actualizacion;
                }).catch((err) => {
                    console.log(err);
                    return "error";
                });
            })
        }).catch((err) => {
            if (typeof err.message !== "undefined" && err.message === "Contraseña incorrecta") {
                return err.message;
            }
            return "error";
        })
    },

    eliminar(usuario) {
        return Usuario.findOne({
            username: usuario.username,
        }).then((usuarioEncontrado) => {
            return bcrypt.compare(usuario.password, usuarioEncontrado.password).then((esValido) => {
                if (esValido !== true) {
                    throw new Error("Contraseña incorrecta");
                }
                return Usuario.deleteOne({
                    username: usuario.username
                });
            });
        }).catch((err) => {
            if (typeof err.message !== "undefined" && err.message === "Contraseña incorrecta") {
                return err.message;
            }
            return "error";
        })
    },

    /**Recibe un email y una contraseña, si son correctos devuelve al usuario */
    comprobarPassword(email, password){
        return Usuario.findOne({
            correo_electronico: email,
        }).then((usuario) => {
            return bcrypt.compare(password, usuario.password).then((esValido) => {
                if (esValido !== true) {
                    throw new Error("Contraseña incorrecta");
                }
                return usuario;
            })
        }).catch((err) => {
            if (typeof err.message !== "undefined" && err.message === "Contraseña incorrecta") {
                return err.message;
            } else if (err.message !== "undefined") {
                return "Datos de inicio de sesión incorrectos";
            }
            return "error";
        })
    },

    consultarPorUsername(username){
        return Usuario.findOne({
            username: username
        }).then((usuario)=>{
            return usuario;
        }).catch((error)=>{
            return "error";
        })
    }
};

module.exports = UsuarioService;