var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var UsuarioService = require(path.join(appRootDir, "services/UsuarioService"));
var Categoria = require(path.join(appRootDir, "Models")).Categoria;

var CategoriaService = {

    consultar(username) {
        return UsuarioService.consultarPorUsername(username).then((usuario)=>{
            if (typeof usuario._id === "undefined"){
                throw new Error("No se encontró al usuario");
            }
            return Categoria.find({
                'creador.$id': usuario._id
            });
        }).catch((err)=>{
            console.log(err);
            return "error";
        })
    },

    crearCategoria(datos) {
        return UsuarioService.consultarPorUsername(datos.username).then((usuario)=>{
            if (typeof usuario._id === "undefined"){
                throw new Error("No se encontró al usuario");
            }
        
            return Categoria.findOne({
                "creador.$id": usuario._id,
                nombre: datos.nombre
            }).then((categoria)=>{
                if (categoria !== null){
                    return "Ya existe una categoría con ese nombre";
                }

                let nuevaCategoria = new Categoria({
                    nombre: datos.nombre,
                    descripcion: datos.descripcion,
                    creador: {
                        '$ref': "usuario",
                        '$id': usuario._id
                    }
                })
                
                return nuevaCategoria.save().then((res)=>{
                    return "OK";
                });
            });

        }).catch((err)=>{
            console.log(err);
            return "No se ha podido crear la categoría. Inténtalo de nuevo más tarde.";
        })
    },

    editarCategoria(datos) {
        return UsuarioService.consultarPorUsername(datos.username).then((usuario)=>{
            if (typeof usuario._id === "undefined"){
                throw new Error("No se encontró al usuario");
            }
        
            return Categoria.findOneAndUpdate({
                "creador.$id": usuario._id,
                nombre: datos.nombre
            }, {
                $set: {
                    nombre: datos.nombre_nuevo, 
                    descripcion: datos.descripcion_nueva
                }
            }).then((res)=>{
                return "OK";
            });
        }).catch((err)=>{
            console.log(err);
            return "error";
        })
    },

    eliminarCategoria(username, nombre) {
        return UsuarioService.consultarPorUsername(username).then((usuario)=>{
            if (typeof usuario._id === "undefined"){
                throw new Error("No se encontró al usuario");
            }
        
            return Categoria.deleteOne({
                "creador.$id": usuario._id,
                nombre: nombre
            }).then((res)=>{
                return "OK";
            });
        }).catch((err)=>{
            console.log(err);
            return "error";
        })
    },
};

module.exports = CategoriaService;