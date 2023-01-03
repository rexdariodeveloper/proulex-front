import { ArchivoProjection } from '@models/archivo';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { Articulo, ArticuloComboProjection } from './articulo';
import { OrdenCompraReciboCompletoProjection } from './orden-compra-recibo';
import { PedidoReciboDetalleLocalidadProjection } from './pedido-recibo-detalle-localidad';
import { RequisicionPartida, RequisicionPartidaConvertirListadoProjection } from './requisicion-partida';
import { UnidadMedida, UnidadMedidaComboProjection } from './unidad-medida';

export class OrdenCompraDetalle {
	public id: number;
	public ordenCompraId: number;
	public articulo: Articulo;
	public articuloId: number;
	public unidadMedida: UnidadMedida;
	public unidadMedidaId: number;
	public factorConversion: number;
	public cantidad: number;
	public precio: number;
	public descuento: number;
	public iva?: number;
	public ivaExento?: boolean;
	public ieps?: number;
	public iepsCuotaFija?: number;
	public requisicionPartida?: RequisicionPartida;
	public requisicionPartidaId?: number;
	public cuentaCompras?: string;
	public comentarios?: string;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public fechaCreacion?: Date;

}

export class OrdenCompraDetalleEditarProjection {

	public id?: number;
    public articulo?: ArticuloComboProjection;
    public articuloId?: number;
    public unidadMedida?: UnidadMedidaComboProjection;
    public unidadMedidaId?: number;
    public factorConversion?: number;
    public cantidad?: number;
    public precio?: number;
    public descuento?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
	public cuentaCompras?: string;
    public comentarios?: string;
    public comentariosRequisicion?: string;
    public imagenArticulo?: ArchivoProjection;
    public fechaModificacion?: Date;

}

export class OrdenCompraDetalleRecibirProjection{

	id?: number;
    articulo?: ArticuloComboProjection;
    unidadMedida?: UnidadMedidaComboProjection;
    cantidad?: number;
    cantidadPendiente?: number;
    requisicionPartida?: RequisicionPartidaConvertirListadoProjection;
	comentarios?: string;

}

export class OrdenCompraDetalleDevolverProjection{

	id?: number;
    articulo?: ArticuloComboProjection;
    unidadMedida?: UnidadMedidaComboProjection;
    cantidad?: number;
    recibosPendientes?: OrdenCompraReciboCompletoProjection[];
    

}

export class OrdenCompraDetalleRelacionarProjection {

	id: number;
	ordenCompraId: number;
    articulo: ArticuloComboProjection;
    cantidad: number;
    cantidadRecibida: number;
	cantidadRelacionada: number;
    iva: number;
    ivaExento: boolean;
    ieps: number;
    iepsCuotaFija: number;
    codigoOC: string;
    fechaRequerida: Date;
    descuento: number;
    precio: number;
    unidadMedida: UnidadMedidaComboProjection;

	comentarios?: string;
    comentariosPartida?: string;
    imagenArticulo?: ArchivoProjection;
	
	cantidadRelacionar?: number;
	iepsCuotaFijaChk?: boolean;
	precioUnitario?: number;

	static parseFromRelacionadoProjection(detalle: OrdenCompraDetalleRelacionadoProjection): OrdenCompraDetalleRelacionarProjection {
		let detalleParced: OrdenCompraDetalleRelacionarProjection = {
			id: detalle.id,
			ordenCompraId: detalle.ordenCompraId,
			articulo: {
				id: detalle.articuloId,
				nombreArticulo: detalle.articuloNombre
			},
			cantidad: detalle.cantidad,
			cantidadRecibida: 0,
			cantidadRelacionada: detalle.cantidadRelacionada,
			iva: detalle.iva,
			ivaExento: detalle.ivaExento,
			ieps: detalle.ieps,
			iepsCuotaFija: detalle.iepsCuotaFija,
			codigoOC: detalle.codigoOC,
			fechaRequerida: detalle.fechaRequerida,
			descuento: detalle.descuento,
			precio: detalle.precio,
			unidadMedida: {
				id: detalle.unidadMedidaId,
				nombre: detalle.unidadMedidaNombre
			},
			precioUnitario: detalle.precioUnitario
		};
		return detalleParced;
	}

}

export class OrdenCompraDetalleRelacionadoProjection {

	public id?: number;
    public ordenCompraId?: number;
    public articuloId?: number;
    public articuloNombre?: string;
    public cantidad?: number;
    public cantidadRelacionada?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public codigoOC?: string;
    public fechaRequerida?: Date;
    public descuento?: number;
    public precio?: number;
    public precioUnitario?: number;
    public unidadMedidaId?: number;
    public unidadMedidaNombre?: string;

}