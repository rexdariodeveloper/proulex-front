import { Rol } from '@models/rol';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';

export class Usuario {
    public id?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public nombreCompleto?: string;
    public correoElectronico?: string;
    public contrasenia?: string;
    public rol?: Rol;
    public pais?: any;
    public paisId?: number;
    public estado?: any;
    public estadoId?: number;
    public municipio?: any;
    public municipioId?: number;
    public fechaUltimaSesion?: string;
    public fechaCreacion?: string;
    public fechaModificacion?: string;
    public IPUltimaSesion?: string;
    public estatusId?: number;
    public tipoId?: number;
    public codigo?: string;
    public token?: string;

    public confirmarContrasenia?: string;
    public rolId?: number;
    public estatus?: ControlMaestroMultiple;
    public activo?: boolean;
    public archivoId?: number;
    public img?: string;
    public img64?: string;
}

export class UsuarioRecuperacion {
    public id?: number;
    public usuarioId?: number;
    public token?: string;
    public fechaExpiracion?: string;
    public estatusId?: number;
    public fechaUltimaModificacion?: string;
}

export class UsuarioListadoProjection {
    id?: number;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    correoElectronico?: string;
    estatusId?: number;
}

export class UsuarioComboProjection {
    id?: number;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    estatusId?: number;
    nombreCompleto?: string;
}