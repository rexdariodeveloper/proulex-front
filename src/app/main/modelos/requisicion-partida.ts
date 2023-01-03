import { Archivo, ArchivoProjection } from '@models/archivo';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { Articulo, ArticuloComboProjection, ArticuloPrecargarProjection } from './articulo';
import { ProveedorComboProjection } from './proveedor';
import { Requisicion, RequisicionConvertirListadoProjection } from './requisicion';
import { UnidadMedida, UnidadMedidaComboProjection } from './unidad-medida';

export class RequisicionPartida {
	public id: number;
    public requisicion: Requisicion;
    public requisicionId: number;
    public numeroPartida: number;
    public articulo: Articulo;
    public articuloId: number;
    public unidadMedida: UnidadMedida;
    public unidadMedidaId: number;
    public fechaRequerida: Date;
    public cantidadRequerida: number;
    public estadoPartida: ControlMaestroMultiple;
    public estadoPartidaId: number;
	public imagenArticulo?: Archivo;
    public imagenArticuloId?: number;
	public img64?: string;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class RequisicionPartidaEditarProjection {
	public id: number;
    public numeroPartida: number;
    public articulo: ArticuloComboProjection;
    public unidadMedida: UnidadMedidaComboProjection;
    public fechaRequerida: Date;
    public cantidadRequerida: number;
    public estadoPartida: ControlMaestroMultipleComboProjection;
    public comentarios: string;
	public imagenArticulo?: ArchivoProjection;
    public imagenArticuloId?: number;
    public img64?: string;
    public fechaModificacion: Date;
}

export class RequisicionPartidaConvertirListadoProjection {
	public id: number;
    public requisicion: RequisicionConvertirListadoProjection;
    public articulo: ArticuloPrecargarProjection;
    public fechaRequerida: Date;
    public unidadMedida: UnidadMedidaComboProjection;
    public cantidadRequerida: number;
    public comentarios: string;

	// campos para uso en front
	public precio: number;
	public proveedor: ProveedorComboProjection;
	public cuentaCompras: string;
	public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
	public iepsCuotaFija?: number;
	public descuento: number;
	public comentariosCompras: string;
}