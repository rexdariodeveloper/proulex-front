import { Programa,ProgramaComboProjection } from './programa';
import { PAModalidad,PAModalidadComboProjection } from './pamodalidad';
import { PAModalidadHorario,PAModalidadHorarioComboProjection } from './pamodalidad-horario';
import { ProgramaIdiomaDescuentoDetalle,ProgramaIdiomaDescuentoDetalleEditarProjection } from './programa-idioma-descuento-detalle';

export class PADescuentoDetalle {
	public id?: number;
    public descuentoDetalleId?: number;
    public programa?: Programa ;
    public programaId?: number;
    public paModalidad?: PAModalidad;
    public paModalidadId?: number;
    public paModalidadHorario?: PAModalidadHorario;
    public paModalidadHorarioId?: number;
    public cursos: ProgramaIdiomaDescuentoDetalle[];
}

export class PADescuentoDetalleEditarProjection{
	public id?: number;
    public descuentoDetalleId?: number;
    public programa?: ProgramaComboProjection;
    public paModalidad?: PAModalidadComboProjection;
    public paModalidadHorario?: PAModalidadHorarioComboProjection;
    public cursos: ProgramaIdiomaDescuentoDetalleEditarProjection[];
}