import { Empleado, EmpleadoComboProjection } from './empleado';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

export class ProgramaGrupoListadoClase {
	public id?: number;
    public grupoId?: number;
    public fecha?: Date;
    public empleado?: Empleado;
    public empleadoId?: number;
    public formaPago?: ControlMaestroMultiple;
    public formaPagoId?: number;
    public comentario?: string;
    public categoriaProfesor?: string;
    public sueldoProfesor?: number;
}

export class ProgramaGrupoListadoClaseEditarProjection{
	public id?: number;
    public grupoId?: number;
    public fecha?: any;
    public comentario?: string;
    public empleado?: EmpleadoComboProjection;
    public formaPago?: ControlMaestroMultipleComboProjection;
    public categoriaProfesor?: string;
    public sueldoProfesor?: number;
    public fechaPago?: number;
    public fechaDeduccion?: any;
}