import { Articulo } from './articulo';
import { Transferencia } from './transferencia';
import { UnidadMedida } from './unidad-medida';

export class TransferenciaDetalle {

	public id?: number;
	public transferenciaId?: number;
	public transferencia?: Transferencia;
	public articuloId?: number;
	public articulo?: Articulo;
	public unidadMedidaId?: number;
	public unidadMedida?: UnidadMedida;
	public cantidad?: number;
	public cantidadTransferida?: number;
	public cantidadDevuelta?: number;
	public spill?: number;
	public estatusId?: number;
}

export class TransferenciaDetalleProjection {

	public id?: number;
	public transferenciaId?: number;
	public articuloId?: number;
	public unidadMedidaId?: number;
	public cantidad?: number;
	public cantidadTransferida?: number;
	public cantidadDevuelta?: number;
	public spill?: number;

	constructor(object: any) {
		
		this.id = object.id || null;
		this.transferenciaId = object.transferenciaId || null;
		this.articuloId = object.articulo.id || null;
		this.unidadMedidaId = object.articulo.unidadMedidaInventario.id || null;
		this.cantidad = object.cantidad || null;
		this.cantidadTransferida = object.cantidadTransferida || 0;
		this.cantidadDevuelta = object.cantidadDevuelta || 0;
		this.spill = object.spill || 0;		
	}
}

export class TransferenciaMovimiento {

	public id?: number;
	public Fecha?: Date;
	public CodigoArticulo?: string;
	public NombreArticulo?: string;
	public UM?: string;
	public CantidadEnviada?: number;
	public CantidadTransferida?: number;
	public CantidadDevuelta?: number;
	public CantidadAjuste?: number;
	public AlmacenOrigen?: string;
	public AlmacenDestino?: string;
	public Usuario?: string;
}