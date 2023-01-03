import { Articulo } from './articulo';
import { UnidadMedida } from './unidad-medida';


export class PedidoDetalle {

	public id?: number;
	public pedidoId?: number;
	public articulo?: Articulo;
	public articuloId?: number;
	public unidadMedida?: UnidadMedida;
	public unidadMedidaId?: number;
	public cantidadPedida?: number;
	public cantidadSurtida?: number;
	public existencia?: number;
	public estatusId?: number;

}

export class PedidoDetalleProjection {

	public id?: number;
	public pedidoId?: number;
	public articuloId?: number;
	public unidadMedidaId?: number;
	public cantidadPedida?: number;
	public cantidadSurtida?: number;
	public existencia?: number;
	public estatusId?: number;

	constructor(object: any) {

		this.id = object.id || null;
		this.pedidoId = object.pedidoId || null;
		this.articuloId = object.articuloId || null;
		this.unidadMedidaId = object.unidadMedidaId || null;
		this.cantidadPedida = object.cantidadPedida || 0;
		this.cantidadSurtida = object.cantidadSurtida || 0;
		this.existencia = object.existencia || 0;
		this.estatusId = object.estatusId || null;
		
	}
}

export class PedidoDetalleMovimiento {

	public id?: number;
	public pedidoId?: number;
	public fechaModificacion?: any;
	public codigo?: string;
	public articuloId?: number;
	public surtir?: number;
	public comentario?: string;
	public origenId?: number;
	public destinoId?: number;

	constructor(object: any) {

		this.id = object.id || null;
		this.pedidoId = object.pedidoId || null;
		this.fechaModificacion = object.fechaModificacion || null;
		this.codigo = object.codigo || null;
		this.articuloId = object.articuloId || null;
		this.surtir = object.surtir || 0;
		this.comentario = object.comentario || null;
		this.origenId = object.origenId || null;
		this.destinoId = object.destinoId || null;
	}
}