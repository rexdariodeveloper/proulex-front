import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { DepartamentoComboProjection } from '@models/departamento';
import { Usuario } from '@models/usuario';

export class ProveedorContacto {
	public id: number;
	public activo: boolean;
	public proveedorId: number;
	public nombre: string;
	public primerApellido: string;
	public segundoApellido: string;
	public departamento: string;
	public telefono: string;
	public extension?: string;
	public correoElectronico: string;
	public horarioAtencion: string;
	public tipoContactoId: number;
	public predeterminado: boolean;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public fechaCreacion?: Date;

}

export class ProveedorContactoEditarProjection {

	id?: number;
    activo?: boolean;
    proveedorId?: number;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    departamento?: string;
    telefono?: string;
    extension?: string;
    correoElectronico?: string;
    horarioAtencion?: string;
    tipoContacto?: ControlMaestroMultipleComboProjection;
    predeterminado?: boolean;
    fechaModificacion?: Date;

}