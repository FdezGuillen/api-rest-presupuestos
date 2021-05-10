var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var UsuarioService = require(path.join(appRootDir, "services/UsuarioService"));
var Presupuesto = require(path.join(appRootDir, "Models")).Presupuesto;
var Divisa = require(path.join(appRootDir, "Models")).Divisa;
var Movimiento = require(path.join(appRootDir, "Models")).Movimiento;

var PresupuestoService = {

    consultar(username) {
        return UsuarioService.consultarPorUsername(username).then((usuario) => {
            if (typeof usuario._id === "undefined") {
                throw new Error("No se encontró al usuario");
            }
            return Presupuesto.find({
                'creador.$id': usuario._id
            });
        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    consultarPorId(id) {
        return Presupuesto.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "divisa",
                    localField: "divisa",
                    foreignField: "codigo",
                    as: "divisa"
                }
            }, {
                $unwind: {
                    path: "$divisa",
                    preserveNullAndEmptyArrays: true
                }
            },

            
        ]).then((presupuestos) => {

            let presupuesto = presupuestos[0];
            return Movimiento.find({
                presupuesto: presupuesto._id,
                tipo: "gasto"
            }).then((gastos)=>{
                presupuesto["gastos_reales"] = gastos;

                return Movimiento.find({
                    presupuesto: presupuesto._id,
                    tipo: "ingreso"
                }).then((ingreso)=>{
                    presupuesto["ingresos_reales"] = ingreso;
                    return presupuesto;
                })
            })
        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    consultarDivisas() {
        return Divisa.find({}).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    crearPresupuesto(datos) {
        return UsuarioService.consultarPorUsername(datos.username).then((usuario) => {
            if (typeof usuario._id === "undefined") {
                throw new Error("No se encontró al usuario");
            }

            let nuevoPresupuesto = new Presupuesto({
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                creador: {
                    '$ref': "usuario",
                    '$id': usuario._id
                },
                objetivo: datos.objetivo,
                fecha_inicio: datos.fecha_inicio,
                fecha_fin: datos.fecha_fin,
                divisa: datos.divisa,
                gastos_previstos: datos.gastos_previstos,
                ingresos_previstos: datos.ingresos_previstos,
                movimientos: []
            })

            return nuevoPresupuesto.save().then((res) => {
                return "OK";
            });


        }).catch((err) => {
            console.log(err);
            return "No se ha podido crear el presupuesto. Inténtalo de nuevo más tarde.";
        })
    },

    editarPresupuesto(datos) {
        return UsuarioService.consultarPorUsername(datos.username).then((usuario) => {
            if (typeof usuario._id === "undefined") {
                throw new Error("No se encontró al usuario");
            }

            return Presupuesto.update({
                _id: datos._id
            }, {
                "$set": {
                    'nombre': datos.nombre,
                    'descripcion': datos.descripcion,
                    'objetivo': datos.objetivo,
                    'fecha_inicio': datos.fecha_inicio,
                    'fecha_fin': datos.fecha_fin,
                    'divisa': datos.divisa,
                    'gastos_previstos': datos.gastos_previstos,
                    'ingresos_previstos': datos.ingresos_previstos,
                }
            },
            {new: true}).then((res) => {
                let movimientos = [];

                datos.gastos_reales.forEach((g)=>{
                    g["presupuesto"] = datos._id;
                    g["usuario"] = usuario._id;
                    movimientos.push(g);
                });

                datos.ingresos_reales.forEach((g)=>{
                    g["presupuesto"] = datos._id;
                    g["usuario"] = usuario._id;
                    movimientos.push(g);
                });
                
                return Movimiento.deleteMany({
                    presupuesto: datos._id,
                    usuario: usuario._id
                }).then((res)=>{
                    return Movimiento.insertMany(movimientos).then((res)=>{
                        return "OK";
                    })
                })
                
            });
        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },

    eliminarPresupuesto(id) {

        return Presupuesto.deleteOne({
            _id: id
        }).then((res) => {
            return "OK";

        }).catch((err) => {
            console.log(err);
            return "error";
        })
    },
};

module.exports = PresupuestoService;