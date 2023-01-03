import { Articulo } from './articulo';
import { InventarioFisico } from './inventario-fisico';
import { UnidadMedida } from './unidad-medida';

export class InventarioFisicoDetalle {

	public id?: number;
	public inventarioFisicoId?: number;
	public inventarioFisico?: InventarioFisico;
	public articuloId?: number;
	public articulo?: Articulo;
	public unidadMedidaId?: number;
	public unidadMedida?: UnidadMedida;
	public conteo?: number;
	public existencia?: number;
}

export class InventarioFisicoDetalleProjection {

	public id?: number;
	public inventarioFisicoId?: number;
	public articuloId?: number;
	public unidadMedidaId?: number;
	public conteo?: number;
	public existencia?: number;

	constructor(object: any) {

		this.id = object.id || null;
		this.inventarioFisicoId = object.inventarioFisicoId || null;
		this.articuloId = object.articulo.id || null;
		this.unidadMedidaId = object.articulo.unidadMedidaInventario.id || null;
		this.conteo = object.conteo || 0;
		this.existencia = object.existencia || 0;
	}
}