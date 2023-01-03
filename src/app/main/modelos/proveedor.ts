import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { CXPFacturaProgramacionPagoProjection, CXPFacturaPagoProveedoresProjection, CXPFacturaProgramacionPagoBeneficiarioProjection } from './cxpfactura';
import { CXPSolicitudPagoDetalleListadoProjection } from './cxpsolicitud-detalle';
import { EstadoComboProjection } from './estado';
import { MonedaComboProjection } from './moneda';
import { PaisComboProjection } from './pais';
import { ProveedorContacto, ProveedorContactoEditarProjection } from './proveedor-contacto';
import { ProveedorFormaPago, ProveedorFormaPagoEditarProjection } from './proveedor-forma-pago';

export class Proveedor {
	public id: number;
	public activo: boolean;
	public codigo: string;
	public nombre: string;
	public razonSocial: string;
	public rfc: string;
	public domicilio: string;
	public colonia: string;
	public paisId: number;
	public estadoId?: number;
	public ciudad: string;
	public cp: string;
	public telefono: string;
	public extension?: string;
	public correoElectronico: string;
	public paginaWeb?: string;
	public diasPlazoCredito: number;
	public montoCredito?: number;
	public diasPago?: string;
	public monedaId: number;
	public cuentaContable?: string;

	public contactos?: ProveedorContacto[];
	public formasPago?: ProveedorFormaPago[];

	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public fechaModificacion?: Date;
	public fechaCreacion?: Date;

}


export class ProveedorComboProjection {
	id: number;
	nombre: string;
}

export class ProveedorRelacionarProjection {
	id: number;
	nombre: string;
	codigo: string;
	rfc: string;
	diasVencimiento: number;
}

export class ProveedorProgramacionPagoProjection {

	public id: number;
	public nombre: string;
	public codigo: string;
	public rfc: string;
	public facturasProgramacion: CXPFacturaProgramacionPagoBeneficiarioProjection[];

}

export class ProveedorPagoProveedoresProjection {

	public id: number;
	public nombre: string;
	public codigo: string;
	public rfc: string;
	public montoProgramado: number;
	public facturas: CXPFacturaPagoProveedoresProjection[];
	public detalles: CXPSolicitudPagoDetalleListadoProjection[];

	public saldo?: number;

}

export class ProveedorReporteAntiguedadSaldosDetalleProjection {

	public facturaId: number;
	public proveedorId: number;
	public proveedorCodigo: string;
	public proveedorNombre: string;
	public codigoRegistro: string;
	public fechaRegistro: Date;
	public fechaVencimiento: Date;
	public diasVencimiento: number;
	public montoRegistro: number;
	public montoActual: number;
	public montoP1: number;
	public montoP2: number;
	public montoP3: number;
	public montoP4: number;

}

export class ProveedorReporteAntiguedadSaldosResumenProjection {

	public id: number;
	public codigo: string;
	public nombre: string;
	public montoRegistro: number;
	public montoActual: number;
	public montoP1: number;
	public montoP2: number;
	public montoP3: number;
	public montoP4: number;

}

export class ProveedorEditarProjection {

	public id?: number;
    public codigo?: string;
    public tipoProveedor?: ControlMaestroMultipleComboProjection;
    public activo?: boolean;
    public nombre?: string;
    public razonSocial?: string;
    public rfc?: string;
    public domicilio?: string;
    public colonia?: string;
    public pais?: PaisComboProjection;
    public estado?: EstadoComboProjection;
    public ciudad?: string;
    public cp?: string;
    public telefono?: string;
    public extension?: string;
    public correoElectronico?: string;
    public paginaWeb?: string;
    public diasPlazoCredito?: number;
    public montoCredito?: number;
    public diasPago?: string;
    public moneda?: MonedaComboProjection;
    public cuentaContable?: string;
    public contactos?: ProveedorContactoEditarProjection[];
    public formasPago?: ProveedorFormaPagoEditarProjection[];
    public fechaModificacion?: Date;

}