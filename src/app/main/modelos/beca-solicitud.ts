import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario, UsuarioComboProjection } from "@models/usuario";
import { BecaUDG, BecaUDGEditarProjection } from './becas-udg';

export class BecaSolicitud {
	public id?: number;
    public codigo?: string;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
    public creadoPorId?: number;
    public creadoPor?: Usuario;
    public modificadoPorId?: Usuario;
    public modificadoPor?: Usuario;
    public becas?: BecaUDG[];
}

export class BecaSolicitudEditarProjection {
	public id?: number;
    public codigo?: string;
    public estatus?: ControlMaestroMultipleComboProjection;
    public creadoPor?: UsuarioComboProjection;
    public fechaCreacion?: Date;
    public becas?: BecaUDGEditarProjection[];
}