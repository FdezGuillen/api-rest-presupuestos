// Gestionar imágenes
var sharp = require('sharp');
const sizeOf = require('image-size')

/** Recibe un buffer con la imagen y reduce su tamaño manteniendo el ratio */ 
exports.reducirImagen = function (imagen) {
    let dimensionesActuales = sizeOf(imagen);

    let nuevoTamanyo = {
        height: 100,
        width: 100
    };

    if (dimensionesActuales.height > dimensionesActuales.width){
        nuevoTamanyo.height = parseInt(Math.floor(dimensionesActuales.height*100/dimensionesActuales.width));
    }else if (dimensionesActuales.height < dimensionesActuales.width){
        nuevoTamanyo.width = parseInt(Math.floor(dimensionesActuales.width*100/dimensionesActuales.height));
    }

    return sharp(imagen).resize(nuevoTamanyo).toBuffer()
        .then((nuevaImagen) => {
            return nuevaImagen;
        })
        .catch((err) => {
            console.log(err);
            return "error";
        });
};

