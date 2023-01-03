import { ArchivoEstructuraCarpeta } from './archivo-estructura-carpeta';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from './control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from './usuario';

export class Archivo {

	id?: number;
    nombreOriginal?: string;
    nombreFisico?: string;
    archivoEstructuraCarpeta?: ArchivoEstructuraCarpeta;
    estructuraId?: number;
    tipoId?: number;
    tipo?: ControlMaestroMultiple;
    rutaFisica?: string;
    publico?: boolean;
    activo?: boolean;
    fechaCreacion?: Date;
    creadoPorId?: number;
    creadoPor?: Usuario;

}

export class ArchivoProjection {

	id?: number;
	nombreOriginal?: string;
	tipo?: ControlMaestroMultipleComboProjection;
    nombreFisico?: string;
    rutaFisica?: string;
    publico?: boolean;
    activo?: boolean;
    creadoPor?: UsuarioComboProjection;
    fechaCreacion?: Date;

}