import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Localidad } from './localidad';
import { TransferenciaDetalle } from './transferencia-detalle';

export class Transferencia {

	public id?: number;
	public codigo?: string;
	public fecha?: Date;
	public localidadOrigenId?: number;
	public localidadOrigen?: Localidad;
	public localidadDestinoId?: number;
	public localidadDestino?: Localidad;
	public comentario?: string;
	public estatusId?: number;
	public estatus?: ControlMaestroMultiple;
	public creadoPorId?: number;
	public creadoPor?: any;
	public modificadoPorId?: number;
	public fechaCreacion?: Date;
	public fechaModificacion?: Date;

	public transferenciaDetalles: TransferenciaDetalle[];
}

export class TransferenciaProjection {

	public id?: number;
	public codigo?: string;
	public fecha?: string;
	public localidadOrigen?: Localidad;
	public localidadDestino?: Localidad;
	public comentario?: string;

	public fechaModificacion: any;

	public transferenciaDetalles: TransferenciaDetalle[];

	constructor(object: any, detalles?: any) {
		
		this.id = object.id || null;
		this.codigo = object.codigo || null;
		this.fecha = object.fecha || null;
		this.localidadOrigen = object.localidadOrigen || null;
		this.localidadDestino = object.localidadDestino || null;
		this.comentario = object.comentario || null;
		this.fechaModificacion = object.fechaModificacion || null;

		this.transferenciaDetalles = detalles || [];
	}
}