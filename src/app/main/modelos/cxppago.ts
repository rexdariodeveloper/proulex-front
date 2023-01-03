import { Archivo } from '@models/archivo';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { CXPPagoDetalle } from './cxppago-detalle';
import { Moneda } from './moneda';
import { Proveedor } from './proveedor';

export class CXPPago {

	public id?: number;
    public proveedor?: Proveedor;
    public proveedorId?: number;
    public remitirA?: string;
    public cuentaBancaria?: string;
    public formaPago?: ControlMaestroMultiple;
    public formaPagoId?: number;
    public fechaPago?: Date;
    public identificacionPago?: string;
    public montoPago?: number;
    public moneda?: Moneda;
    public monedaId?: number;
    public paridadOficial?: number;
    public paridadUsuario?: number;
    public estatus?: ControlMaestroMultiple;
	public estatusId?: number;
	public comprobante?: Archivo;
    public comprobanteId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public detalles?: CXPPagoDetalle[];
	
	public solicitudId?: number;

}