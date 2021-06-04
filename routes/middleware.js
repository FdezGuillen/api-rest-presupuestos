var jwt = require('jwt-simple');
var moment = require('moment');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var config = require(path.join(appRootDir,'config'));

// Middleware para peticiones con autenticación
exports.ensureAuthenticated = function (req, res, next) {
    
    //Si la petición no lleva token, devuelve error
    if (!req.headers["x-access-token"]) {
       
        return res
            .status(403)
            .send({
                message: "Acceso no autorizado. Inicia sesión primero"
            });
    }

    //Decodifica el token y si la sesión ha expirado, devuelve error
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

    // En este punto se ha comprobado que el token es correcto. Se 
    // permite que el resto del código se siga ejecutando
    next();
}

