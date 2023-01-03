import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { PAModalidad, PAModalidadComboProjection, PAModalidadComboSimpleProjection } from './pamodalidad';
import { PAModalidadHorario, PAModalidadHorarioComboProjection, PAModalidadHorarioComboSimpleProjection } from './pamodalidad-horario';
import { Programa, ProgramaComboProjection } from './programa';

export class PrecioIncompanyDetalle {
	public id?: number;
    public precioIncompanyId?: number;
    public zona?: ControlMaestroMultiple;
    public zonaId?: number;
    public precioVenta?: number;
    public porcentajeTransporte?: number;
    public idioma?: ControlMaestroMultiple;
    public idiomaId?: number;
    public programa?: Programa;
    public programaId?: number;
    public modalidad?: PAModalidad;
    public modalidadId?: number;
    public horario?: PAModalidadHorario;
    public horarioId?: number;
    public activo?: boolean;
}

export class PrecioIncompanyDetalleEditarProjection{
	public id?: number;
    public precioIncompanyId?: number;
    public zona?: ControlMaestroMultipleComboProjection;
    public precioVenta?: number;
    public porcentajeTransporte?: number;
    public idioma?: ControlMaestroMultipleComboProjection;
    public programa?: ProgramaComboProjection;
	public modalidad?: PAModalidadComboProjection;
	public horario?: PAModalidadHorarioComboSimpleProjection;
	public activo?: boolean;
}