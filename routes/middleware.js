var jwt = require('jwt-simple');
var moment = require('moment');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var config = require(path.join(appRootDir,'config'));

exports.ensureAuthenticated = function (req, res, next) {
    console.log(req.headers["x-access-token"]);
    if (!req.headers["x-access-token"]) {
       
        return res
            .status(403)
            .send({
                message: "Acceso no autorizado. Inicia sesión primero"
            });
    }
    var token = req.headers["x-access-token"];
    var payload = jwt.decode(token, config.TOKEN_SECRET);

    if (payload.exp <= moment().unix()) {
        return res
            .status(401)
            .send({
                message: "La sesión ha expirado"
            });
    }
    req.user = payload.sub;
    next();
}