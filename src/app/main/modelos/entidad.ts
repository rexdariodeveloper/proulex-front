import { Usuario } from '@models/usuario';
import { Empleado, EmpleadoComboProjection } from './empleado';
import { Pais, PaisComboProjection } from './pais';
import { Estado, EstadoComboProjection } from './estado';
import { EntidadContrato, EntidadContratoEditarProjection } from './entidad-contrato';

export class Entidad {
	public id?: number;
    public codigo?: string;
    public prefijo?: string;
    public nombre?: string;
    public razonSocial?: string;
    public nombreComercial?: string;
    public director?: Empleado;
    public directorId?: number;
    public coordinador?: Empleado;
    public coordinadorId?: number;
    public jefeUnidadAF?: Empleado;
    public jefeUnidadAFId?: number;
    public domicilio?: string;
    public colonia?: string;
    public cp?: string;
    public pais?: Pais;
    public paisId?: number;
    public estado?: Estado;
    public estadoId?: number;
    public ciudad?: string;
    public entidadIndependiente?: Entidad;
    public entidadIndependienteId?: number;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion: Date;
    public contratos: EntidadContrato[];
    public aplicaSedes?: boolean;
}

export class EntidadEditarProjection {
	public id?: number;
    public codigo?: string;
    public prefijo?: string;
    public nombre?: string;
    public razonSocial?: string;
    public nombreComercial?: string;
    public director?: EmpleadoComboProjection;
	public coordinador?: EmpleadoComboProjection;
	public jefeUnidadAF?: EmpleadoComboProjection;
	public domicilio?: string;
    public colonia?: string;
    public cp?: string;
    public pais?: PaisComboProjection;
	public estado?: EstadoComboProjection;
	public ciudad?: string;
	public entidadIndependiente?: EntidadComboProjection;
	public activo?: boolean;
    public aplicaSedes?: boolean;
	public contratos: EntidadContratoEditarProjection[];
}

export class EntidadComboProjection {
	public id?: number;
	public nombre?: string;
}