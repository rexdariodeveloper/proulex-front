import { Archivo, ArchivoProjection } from '@models/archivo';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { CXPFacturaDetalle, CXPFacturaDetalleEditarProjection, CXPSolicitudFacturaDetalleEditarProjection } from './cxpfactura-detalle';
import { CXPSolicitudPagoServicioConfirmarInfoProjection } from './cxpsolicitud-pago-servicio';
import { Moneda, MonedaComboProjection } from './moneda';
import { OrdenCompraRelacionarProjection } from './orden-compra';
import { OrdenCompraDetalleRelacionarProjection } from './orden-compra-detalle';
import { Proveedor, ProveedorComboProjection, ProveedorRelacionarProjection } from './proveedor';

export class CXPFactura{

    public id?: number;
    public codigoRegistro?: string;
    public tipoRegistro?: ControlMaestroMultiple;
    public tipoRegistroId?: number;
    public proveedor?: Proveedor;
    public proveedorId?: number;
    public fechaRegistro?: Date;
    public fechaReciboRegistro?: Date;
    public moneda?: Moneda;
    public monedaId?: number;
    public paridadOriginal?: number;
    public paridadUsuario?: number;
    public diasCredito?: number;
    public montoRegistro?: number;
    public fechaPago?: Date;
    public comentarios?: string;
    public tipoPago?: ControlMaestroMultiple;
    public tipoPagoId?: number;
    public uuid?: string;
    public estatus?: ControlMaestroMultiple;
	public estatusId?: number;
	public facturaXML?: Archivo;
    public facturaXMLId?: number;
    public facturaPDF?: Archivo;
	public facturaPDFId?: number;
	public fechaCancelacion?: Date;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public detalles?: CXPFacturaDetalle[];
    public paridadOficial?: number;
    public motivoCancelacion?: string;
    
    public monedaCodigo?: string;
}

export class CXPFacturaEditarProjection{

	public id: number;
    public codigoRegistro: string;
    public tipoRegistro: ControlMaestroMultipleComboProjection;
    public proveedor: ProveedorRelacionarProjection;
    public fechaRegistro: Date;
    public fechaReciboRegistro: Date;
    public moneda: MonedaComboProjection;
    public monedaCodigo: string;
    public paridadOficial: number;
    public paridadUsuario: number;
    public diasCredito: number;
    public remitirA: string;
    public montoRegistro: number;
    public fechaPago: Date;
    public comentarios: string;
    public tipoPago: ControlMaestroMultipleComboProjection;
    public uuid: string;
    public estatus: ControlMaestroMultipleComboProjection;
    public fechaVencimiento: Date;
	public fechaCancelacion?: Date;
	public fechaModificacion: Date;
	public facturaPDF: ArchivoProjection;
	public facturaXML: ArchivoProjection;
	
	public retenciones: CXPFacturaDetalleEditarProjection[];

	public detalles: CXPFacturaDetalleEditarProjection[];

}

export class CXPFacturaListadoProjection{

	public id: number;
    public proveedor: ProveedorComboProjection;
    public codigoRegistro: string;
    public montoRegistro: number;
    public fechaRegistro: Date;
    public fechaVencimiento: Date;
    public ordenCompraTexto: string;
    public fechaReciboRegistro: Date;
    public relacionada: boolean;

}

export class CXPFacturaProgramacionPagoProjection {

	public id: number;
    public estatus: ControlMaestroMultipleComboProjection;
    public codigoRegistro: string;
    public montoRegistro: number;
    public montoProgramado: number;
    public saldo: number;
    public codigoMoneda: string;
    public fechaRegistro: Date;
    public fechaVencimiento: Date;
    public ordenCompraTexto: string;
    public folioSolicitudPago: string;
    public evidencia: ArchivoProjection[];
    public evidenciaDocumentosRh: ArchivoProjection[];
	public facturas: ArchivoProjection[];
	public cxpSolicitudesPagosServicios?: CXPSolicitudPagoServicioConfirmarInfoProjection[];
    public fechaModificacion: Date;

}

export class CXPFacturaProgramacionPagoBeneficiarioProjection {

	public id: number;
    public estatus: ControlMaestroMultipleComboProjection;
    public codigoRegistro: string;
    public montoRegistro: number;
    public montoProgramado: number;
    public saldo: number;
    public codigoMoneda: string;
    public fechaRegistro: Date;
    public fechaVencimiento: Date;
    public ordenCompraTexto: string;
    public folioSolicitudPago: string;
    public evidencia: ArchivoProjection[];
    public evidenciaDocumentosRh: ArchivoProjection[];
	public facturas: ArchivoProjection[];
	public cxpSolicitudesPagosServicios?: CXPSolicitudPagoServicioConfirmarInfoProjection[];
    public fechaModificacion: Date;
    public beneficiario: string;

}

export class CXPFacturaPagoProveedoresProjection {

	public id: number;
    public codigoRegistro: string;
    public montoRegistro: number;
    public saldo: number;
    public fechaRegistro: Date;
    public fechaVencimiento: Date;
    public ordenCompraTexto: string;
    public facturaPDFId?: number;
    public facturaXMLId?: number;

	// Campos para uso solo del front
	public montoProgramado?: number;

}

export class CXPSolicitudFacturaEditarProjection{

	public id?: number;
    public codigoRegistro?: string;
    public tipoRegistro?: ControlMaestroMultipleComboProjection;
    public tipoRegistroId?: number;
    public proveedor?: ProveedorRelacionarProjection;
    public proveedorId?: number;
    public fechaRegistro?: any;
    public fechaReciboRegistro?: any;
    public moneda?: MonedaComboProjection;
    public monedaId?: number;
    public monedaCodigo?: string;
    public paridadOficial?: number;
    public paridadUsuario?: number;
    public diasCredito?: number;
    public montoRegistro?: number;
    public fechaPago?: any;
    public comentarios?: string;
    public tipoPago?: ControlMaestroMultipleComboProjection;
    public tipoPagoId?: number;
    public uuid?: string;
    public estatus?: ControlMaestroMultipleComboProjection;
    public estatusId?: number;
    public facturaPDF?: ArchivoProjection;
    public facturaPDFId?: number;
    public facturaXML?: ArchivoProjection;
    public facturaXMLId?: number;
    public detalles?: CXPSolicitudFacturaDetalleEditarProjection[];

}

export class CXPFacturaAlertaCXPSPProjection{

    public id?: number;
    public codigoRegistro?: string;
	public montoRegistro?: number;
	public fechaRegistro?: any;
    public fechaVencimiento?: any;
	public proveedor?: ProveedorComboProjection;

}