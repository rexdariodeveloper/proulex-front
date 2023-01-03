import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { Puesto } from '@models/puesto';

export class Departamento {
	public id: number;
	public activo: boolean;
	public departamentoPadreId?: number;
	public prefijo: string;
	public nombre: string;
	public responsableId: number;
	public autoriza: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
	public fechaCreacion?: Date;
    public numeroVacantes?: number;
    public propositoPuesto?: string;
    public observaciones?: string;
    public puestoId?: number;
    public puesto?: Puesto;
    public responsabilidadHabilidad?: any[];
	
	public usuariosPermisos?: Usuario[];

}

export class DepartamentoNodoProjection {
	public id: number;
	public prefijo: string;
	public nombre: string;
	public responsable: UsuarioComboProjection;
	public departamentoPadre: DepartamentoComboProjection;
	public autoriza: boolean;
	public activo: boolean;
	public fechaModificacion: Date;

	public usuariosPermisos?: Usuario[];
	
	public info: DepartamentoComboProjection;
	public children: DepartamentoNodoProjection[];
	public ocultarSeleccion: boolean;
	public ocultarAcciones: boolean;
	public selected: boolean;
    
    public numeroVacantes?: number;
    public propositoPuesto?: string;
    public observaciones?: string;
    public puestoId?: number;
    public puesto?: Puesto;
    public responsabilidadHabilidad?: any[];

}

export class DepartamentoComboProjection {
	public id: number;
	public prefijo: string;
	public nombre: string;

}