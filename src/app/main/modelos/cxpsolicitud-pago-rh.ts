import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { CXPFactura, CXPFacturaEditarProjection, CXPSolicitudFacturaEditarProjection } from './cxpFactura';
import { Sucursal,SucursalComboProjection } from './sucursal';
import { Empleado, EmpleadoComboProjection } from './empleado';
import { CXPSolicitudPagoRHBecarioDocumento, CXPSolicitudPagoRHBecarioDocumentoEditarProjection } from './cxpsolicitud-pago-rh-becario-documento';
import { CXPSolicitudPagoRHIncapacidad, CXPSolicitudPagoRHIncapacidadEditarProjection } from './cxpsolicitud-pago-rh-incapacidad';
import { CXPSolicitudPagoRHPensionAlimenticiaEditarProjection } from './cxpsolicitud-pago-rh-pension-alimenticia';
import { CXPSolicitudPagoRHRetiroCajaAhorro, CXPSolicitudPagoRHRetiroCajaAhorroEditarProjection } from './cxpsolicitud-pago-rh-retiro-caja-ahorro';

export class CXPSolicitudPagoRH {
	public id: number;
    public codigo: string;
    public factura: CXPFactura;
    public facturaId: number;
    public sucursal: Sucursal;
    public sucursalId: number;
    public empleado: Empleado;
    public empleadoId: number;
    public tipoPago: ControlMaestroMultiple;
    public tipoPagoId: number;
    public monto: number;
    public comentarios?: string;
    public estatus: ControlMaestroMultiple;
    public estatusId: number;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
    public becarioDocumentos: CXPSolicitudPagoRHBecarioDocumento[];
    public incapacidad: CXPSolicitudPagoRHIncapacidad[];
    public cajaAhorro: CXPSolicitudPagoRHRetiroCajaAhorro[];
    public pensionAlimenticia: CXPSolicitudPagoRHPensionAlimenticiaEditarProjection[];
}

export class CXPSolicitudPagoRHComboProjection {
	public id?: number;
    public codigo?: string;
}

export class CXPSolicitudPagoRHEditarProjection {
	public id?: number;
    public codigo?: string;
    public empleado?: EmpleadoComboProjection;
    public sucursal?: SucursalComboProjection;
    public tipoPago?: ControlMaestroMultipleComboProjection;
    public monto?: number;
    public comentarios?: string;
    public estatus?: ControlMaestroMultipleComboProjection;
    public fechaModificacion?: Date;
    public becarioDocumentos?: CXPSolicitudPagoRHBecarioDocumentoEditarProjection[];
    public incapacidad?: CXPSolicitudPagoRHIncapacidadEditarProjection[];
    public cajaAhorro?: CXPSolicitudPagoRHRetiroCajaAhorroEditarProjection[];
    public pensionAlimenticia?: CXPSolicitudPagoRHPensionAlimenticiaEditarProjection[];
    //public factura?: CXPSolicitudFacturaEditarProjection;
    public fechaCreacion?: Date;
}

export class CXPSolicitudPagoRHListadoProjection{
	public id?: number;
    public codigo?: string;
    public fechaCreacion?: Date;
    public nombre?: string;
    public tipoPago?: string
    public monto?: number;
    public usuarioCreador?: string;
    public estatus?: string;
    public sedeId?: number;
}