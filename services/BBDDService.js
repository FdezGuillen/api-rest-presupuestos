var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var UsuarioService = require(path.join(appRootDir, "services/UsuarioService"));
var Divisa = require(path.join(appRootDir, "Models")).Divisa;

// Servicio para rellenar tabla de divisas

var divisas = [{
    "nombre": "EUR",
    "simbolo": "€",
    "codigo": "cod_euro"
}, {
    "nombre": "USD",
    "simbolo": "$",
    "codigo": "cod_dolar"
}, {
    "nombre": "JPY",
    "simbolo": "¥",
    "codigo": "cod_yen"
}, {
    "nombre": "GBP",
    "simbolo": "£",
    "codigo": "cod_libra"
}, {
    "nombre": "CNY",
    "simbolo": "¥",
    "codigo": "cod_yuan"
}]


var BBDDService = {

    insertarDivisas() {
        Divisa.find({}).exec().then((res) => {
            if (res.length == 0) {
                Divisa.insertMany(divisas)
            }
        }).catch((err) => {
            console.log(err);
        })
    },
};

module.exports = BBDDService;