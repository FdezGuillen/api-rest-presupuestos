var mongoose = require('mongoose');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var UsuarioService = require(path.join(appRootDir, "services/UsuarioService"));
var Divisa = require(path.join(appRootDir, "Models")).Divisa;

var divisas = [{
    "_id": {
        "$oid": "60980f745b500424fc63ff09"
    },
    "nombre": "EUR",
    "simbolo": "€",
    "codigo": "cod_euro"
}, {
    "_id": {
        "$oid": "60980f8f7064f3467cef6ac5"
    },
    "nombre": "USD",
    "simbolo": "$",
    "codigo": "cod_dolar"
}, {
    "_id": {
        "$oid": "609810177064f3467cef6ac6"
    },
    "nombre": "JPY",
    "simbolo": "¥",
    "codigo": "cod_yen"
}, {
    "_id": {
        "$oid": "6098103a7064f3467cef6ac7"
    },
    "nombre": "GBP",
    "simbolo": "£",
    "codigo": "cod_libra"
}, {
    "_id": {
        "$oid": "6098108f7064f3467cef6ac8"
    },
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