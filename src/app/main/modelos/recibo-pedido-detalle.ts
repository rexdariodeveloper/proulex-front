import { Articulo } from './articulo';
import { PedidoReciboDetalleLocalidad, PedidoReciboDetalleLocalidadProjection } from './pedido-recibo-detalle-localidad';
import { UnidadMedida } from './unidad-medida';


export class PedidoReciboDetalle {

	public id: number;
	public pedidoReciboId: number;
	public articulo: Articulo;
	public articuloId: number;
	public unidadMedida: UnidadMedida;
	public unidadMedidaId: number;
	public cantidadPedida: number;
	public cantidadDevuelta: number;
	public spill: number;
	public comentario: string;
	public estatusId: number;

	public localidades?: PedidoReciboDetalleLocalidad[];

}

export class PedidoReciboDetalleProjection {

	public id: number;
	public pedidoReciboId: number;
	public articuloId: number;
	public articulo: Articulo;
	public unidadMedidaId: number;
	public unidadMedida: UnidadMedida;
	public cantidadPedida: number;
	public cantidadDevuelta: number;
	public spill: number;
	public comentario: string;
	public estatusId: number;

	public localidades?: PedidoReciboDetalleLocalidadProjection[];

	constructor(object: any) {

		this.id = object.id || null;
		this.articuloId = object.articuloId || null;
		this.unidadMedidaId = object.unidadMedidaId || null;
		this.cantidadPedida = object.cantidadPedida || Number(null);
		this.cantidadDevuelta = object.cantidadDevuelta || Number(null);
		this.spill = object.spill || Number(null);
		this.comentario = object.comentario?.trim() || null;
		this.estatusId = object.estatusId || null;
		this.localidades = object.localidades || [];
	}
}