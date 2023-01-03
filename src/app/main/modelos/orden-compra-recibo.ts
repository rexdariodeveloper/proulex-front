import { Archivo, ArchivoProjection } from '@models/archivo';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { AlmacenComboProjection } from './almacen';
import { ArticuloComboProjection } from './articulo';
import { CXPFacturaDetalle } from './cxpfactura-detalle';
import { Localidad, LocalidadComboProjection } from './localidad';
import { OrdenCompra, OrdenCompraCargarReciboProjection } from './orden-compra';
import { OrdenCompraDetalle } from './orden-compra-detalle';
import { UnidadMedidaComboProjection } from './unidad-medida';

export class OrdenCompraRecibo {

	public id?: number;
    public ordenCompra?: OrdenCompra;
    public ordenCompraId?: number;
    public ordenCompraDetalle?: OrdenCompraDetalle;
    public ordenCompraDetalleId?: number;
    public reciboReferencia?: OrdenCompraRecibo;
    public reciboReferenciaId?: number;
    public fechaRequerida?: Date;
    public fechaRecibo?: Date;
    public cantidadRecibo?: number;
    public localidad?: Localidad;
    public localidadId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public facturaPDF?: Archivo;
    public facturaPDFId?: number;
    public facturaXML?: Archivo;
    public facturaXMLId?: number;
    public devoluciones?: OrdenCompraRecibo[];
    public evidencia?: Archivo[];
    public cxpFacturasDetalles?: CXPFacturaDetalle[];

    public cantidadDevolver?: number;

}

export class OrdenCompraReciboCompletoProjection {

	id?: number;
	ordenCompraDetalleId?: number;
	cantidadRecibo?: number;
	cantidadPendienteDevolver?: number;
	fechaRecibo?: Date;
	articulo?: ArticuloComboProjection;
	unidadMedida?: UnidadMedidaComboProjection;
	cantidadRequerida?: number;
	almacen?: AlmacenComboProjection;
	devoluciones?: OrdenCompraReciboDevolucionProjection[];
	localidadId?: number;

	creadoPor?: UsuarioComboProjection;

}

export class OrdenCompraReciboDevolucionProjection {

	id?: number;
	cantidadRecibo?: number;

}

export class OrdenCompraReciboCargarFacturaProjection{

	id: number;
	ordenCompra: OrdenCompraCargarReciboProjection;
	ordenCompraDetalleId: number;
    cantidadRecibo: number;
    cantidadDevuelta: number;
    facturaPDF: ArchivoProjection;
    facturaXML: ArchivoProjection;

}

export class OrdenCompraReciboListadoProjection {

	public id?: number;
    public fechaCreacion?: Date;
    public tipoMovimiento?: string;
    public articulo?: ArticuloComboProjection;
    public unidadMedida?: UnidadMedidaComboProjection;
    public cantidad?: number;
    public almacen?: AlmacenComboProjection;
    public creadoPor?: UsuarioComboProjection;
    public facturas?: ArchivoProjection[];
    public evidencia?: ArchivoProjection[];

}