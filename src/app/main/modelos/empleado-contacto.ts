import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';

export class EmpleadoContacto {
    public id: number;
    public empleadoId: number;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido?: string;
    public parentesco?: string;
    public telefono?: string;
    public movil?: string;
    public correoElectronico: string;
    public borrado: boolean;
    public fechaCreacion: Date;
    public creadoPor?: Usuario;
	public creadoPorId?: number;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public fechaModificacion?: Date;
}

export class EmpleadoContactoComboProjection {
    public id: number;
    public nombreCompleto: string;
}

export class EmpleadoContactoEditarProjection {
    public id?: number;
    public empleadoId?: number;
    public nombre?: string;
    public primerApellido: string;
    public segundoApellido?: string;
    public parentesco?: string;
    public telefono?: string;
    public movil?: string;
    public correoElectronico?: string;
    public borrado?: boolean;
}

export class EmpleadoContactoListadoProjection {
    public id?: number;
    public nombreCompleto?: string;
    public parentesco?: string;
    public telefono?: string;
    public movil?: string;
    public correoElectronico?: string;
}