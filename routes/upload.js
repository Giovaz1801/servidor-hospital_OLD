var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default 
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            erros: {message: 'Tipo de colección no es válida'}
        });        
    }

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ningun archivo',
            erros: {message: 'Debe de seleccionar una imagen'}
        });
    }

    // Validación de la imagen (extensión)

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            erros: {message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')}
        });
    }

    // Definir nombre del archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ extensionArchivo }`;

    // Mover el archivo a una ruta (path) específica
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    
    archivo.mv(path, err => {

        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                erros: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo subido correctamente',
        //     extensionArchivo: extensionArchivo
        // });

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res){

    if(tipo === 'usuarios'){

        Usuario.findById(id, (err, usuario) => {

            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            
            // Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) =>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo modificar la imagen',
                        erros: {message: 'Algo salió mal'}
                    });
                }

                usuarioActualizado.password = ' :0 ';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    }

    if(tipo === 'medicos'){

        Medico.findById(id, (err,medico) => {

            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo modificar la imagen',
                        erros: {message: 'Algo salió mal'}
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizada',
                    medico: medicoActualizado
                });

            });


        });

    }

    if(tipo === 'hospitales'){

        Hospital.findById(id, (err, hospital) => {
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                });
            }            

            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            
            hospital.save((err, hospitalActualizado) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'No se pudo modificar la imagen',
                        erros: {message: 'Algo salió mal'}
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del Hospital actualizada',
                    medico: hospitalActualizado
                });                

            });

        });

    }

}

module.exports = app;