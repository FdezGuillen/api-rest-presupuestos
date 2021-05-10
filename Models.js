'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const bcryptSalt = process.env.BCRYPT_SALT;

/**Modelos utilizados por la aplicación */

var UsuarioSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellidos: {
    type: String,
  },
  correo_electronico: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  imagen_perfil: {
    type: String,
  },
});

//Encriptamos contraseña
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
  this.password = hash;
  next();
});

const Usuario = mongoose.model("Usuario", UsuarioSchema, 'usuario');

const tokenSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "usuario",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // this is the expiry time in seconds
  },
});

var TokenRecuperacion = mongoose.model("token_recuperacion", tokenSchema, "token_recuperacion");

const categoriaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  creador: {
    "$ref": {
      type: String,
      required: true
    },
    "$id": {
      type: Schema.Types.ObjectId,
      required: true
    },
    "$db": {
      type: String,
      default: "presupuestos_personales"
    }
  }
});
var Categoria = mongoose.model("categoria", categoriaSchema, "categoria");

const presupuestoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  creador: {
    "$ref": {
      type: String,
      required: true
    },
    "$id": {
      type: Schema.Types.ObjectId,
      required: true
    },
    "$db": {
      type: String,
      default: "presupuestos_personales"
    }
  },
  objetivo: {
    type: Number
  },
  fecha_inicio: {
    type: Date,
    required: true
  },
  fecha_fin: {
    type: Date,
  },
  divisa: {
    type: String,
    default: "cod_euro"
  },
  gastos_previstos: [{
    categoria: {
      type: Schema.Types.ObjectId,
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    }
  }],

  ingresos_previstos: [{
    categoria: {
      type: Schema.Types.ObjectId,
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    }
  }],
});
var Presupuesto = mongoose.model("presupuesto", presupuestoSchema, "presupuesto");

var movimientoSchema = new Schema({
  presupuesto: {
    type: Schema.Types.ObjectId,
    required: true
  },
  usuario: {
    type: Schema.Types.ObjectId,
    required: true
  },
    categoria: {
      type: Schema.Types.ObjectId,
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    fecha:{
      type: Date,
      required: true
    },
    tipo: {
      type: String,
      required: true
    }
});

var Movimiento = mongoose.model("movimiento", movimientoSchema, "movimiento");

const divisaSchema = new Schema({
  codigo: {
    type: String, 
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  simbolo: {
    type: String,
    required: true
  }
});
var Divisa = mongoose.model("divisa", divisaSchema, "divisa");

module.exports = {
  Usuario: Usuario,
  TokenRecuperacion: TokenRecuperacion,
  Categoria: Categoria,
  Presupuesto: Presupuesto,
  Divisa: Divisa,
  Movimiento: Movimiento
};