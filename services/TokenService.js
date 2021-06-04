var jwt = require('jwt-simple');
var moment = require('moment');
var path = require('path');
var appRootDir = require('app-root-dir').get();
var config = require(path.join(appRootDir,'config'));

/**Crea un token de autenticación */
exports.createToken = function(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
};





