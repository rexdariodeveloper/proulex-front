import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { PedidoReciboDetalle } from './recibo-pedido-detalle';
import { Pedido } from './pedido';

export class PedidoRecibo {

	public id: number;
	public codigo: string;
	public fecha: Date;
	public pedido: Pedido;
	public pedidoId: number;
	public comentario: string;
	public estatusId: number;
	public estatus: ControlMaestroMultiple;
	public creadoPorId: number;
	public modificadoPorId: number;
	public fechaCreacion: Date;
	public fechaModificacion: Date;

	public detalles?: PedidoReciboDetalle[];
}

export class PedidoReciboProjection {

	public id: number;
	public fecha: Date;
	public pedidoId: number;
	public comentario: string;
	public estatusId: number;
	public creadoPorId: number;
	public modificadoPorId: number;
	public fechaCreacion: Date;
	public fechaModificacion: Date;

	public detalles?: PedidoReciboDetalle[];

	constructor(object: any, detalles?: any) {
		
		this.id = object.id || null;
		this.fecha = object.fecha || null;
		this.pedidoId = object.pedidoId || null;
		this.comentario = object.comentario?.trim() || null;
		this.estatusId = object.estatusId || null;
		this.creadoPorId = object.creadoPorId || null;
		this.modificadoPorId = object.modificadoPorId || null;
		this.fechaCreacion = object.fechaCreacion || null;
		this.fechaModificacion = object.fechaModificacion || null;

		this.detalles = detalles || [];
	}
}