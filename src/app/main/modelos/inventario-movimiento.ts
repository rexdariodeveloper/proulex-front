import { Articulo } from './articulo';
import { Localidad } from './localidad';
import { UnidadMedida } from './unidad-medida';

export class InventarioMovimiento {

	public inventarioMovimientoId?: number;
	public articuloId?: number;
	public articulo?: Articulo;
	public localidadId?: number;
	public localidad?: Localidad;
	public cantidad?: string;
	public costoUnitario?: string;
	public precioUnitario?: string;
	public razon?: string;
	public referencia?: string;
	public referenciaMovtoId?: number;
	public unidadMedidaId?: number;
	public unidadMedida?: UnidadMedida;
	public tipoCostoId?: number;	
	public tipoMovimientoId?: number;
	public creadoPorId?: number;
	public modificadoPorId?: number;
	public fechaCreacion?: Date;
	public fechaModificacion?: Date;
}