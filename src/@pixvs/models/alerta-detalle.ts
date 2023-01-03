import { ControlMaestroMultiple } from './control-maestro-multiple';
import { Alerta } from './alerta';

export class AlertaDetalle {

	public id: number;
	public alertaId: number;
	public estatusDetalleId: number;
	public estatusDetalle: ControlMaestroMultiple;
	public usuarioId: number;
	public fechaAtendido: Date;
	public archivado: Boolean;
	public mostrar: Boolean;
	public visto: Boolean;
	public comentario: string;
	public fechaCreacion: Date;
	public creadoPorId: number;
	public fechaUltimaModificacion: Date;
	public modificadoPorId: number;
	public alerta: Alerta;
	public etapa?: number;


}