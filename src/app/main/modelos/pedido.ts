import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Localidad } from './localidad';
import { PedidoDetalle } from './pedido-detalle';

export class Pedido {

	public id?: number;
	public codigo?: string;
	public fecha?: Date;
	public localidadOrigen?: Localidad;
	public localidadOrigenId?: number;
	public localidadCEDIS?: Localidad;
	public localidadCEDISId?: number;
	public comentario?: string;
	public estatus?: ControlMaestroMultiple;
	public estatusId?: number;
	public creadoPorId?: number;
	public modificadoPorId?: number;
	public fechaCreacion?: Date;
	public fechaModificacion?: Date;

	public detalles?: PedidoDetalle[];
}

export class PedidoProjection {

	public id?: number;
	public codigo?: string;
	public fecha?: Date;
	public localidadOrigen?: Localidad;
	public localidadCEDIS?: Localidad;
	public comentario?: string;

	public detalles?: PedidoDetalle[];

	constructor(object: any, detalles?: any) {
		
		this.id = object.id || null;
		this.codigo = object.codigo || null;
		this.fecha = object.fecha || null;
		this.localidadOrigen = object.localidadOrigen || null;
		this.localidadCEDIS = object.localidadCEDIS || null;
		this.comentario = object.comentario || null;

		this.detalles = detalles || [];
	}
}

export class PedidoMovimiento {

	public id?: number;
	public Fecha?: Date;
	public CodigoArticulo?: string;
	public NombreArticulo?: string;
	public UM?: string;
	public CantidadPedida?: number;
	public CantidadRecibida?: number;
	public CantidadAjuste?: number;
	public Almacen?: string;
	public Usuario?: string;
}