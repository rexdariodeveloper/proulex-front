import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { OrdenVentaCancelacionArchivo, OrdenVentaCancelacionArchivoEditarProjection } from "./orden-venta-cancelacion-archivo";
import { OrdenVentaCancelacionDetalle, OrdenVentaCancelacionDetalleEditarProjection } from "./orden-venta-cancelacion-detalle";

export class OrdenVentaCancelacion {

    public id?: number;
    public codigo?: string;
    public tipoMovimientoId?: number;
    public tipoMovimiento?: ControlMaestroMultiple;
    public fechaDevolucion?: Date;
    public motivoDevolucionId?: number;
    public motivoDevolucion?: ControlMaestroMultiple;
    public fechaCancelacion?: any;
    public motivoCancelacionId?: number;
    public motivoCancelacion?: ControlMaestroMultiple;
    public banco?: string;
    public beneficiario?: string;
    public numeroCuenta?: string;
    public clabe?: string;
    public telefonoContacto?: string;
    public importeReembolsar?: number;
    public tipoCancelacion?: ControlMaestroMultiple;
    public tipoCancelacionId?: number;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: any;
    public fechaModificacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public detalles?: OrdenVentaCancelacionDetalle[];
    public archivos?: OrdenVentaCancelacionArchivo[];
}

export class OrdenVentaCancelacionEditarProjection {

    public id?: number;
    public codigo?: string;
    public tipoMovimientoId?: number;
    public tipoMovimiento?: ControlMaestroMultipleComboProjection;
    public fechaDevolucion?: Date;
    public motivoDevolucion?: ControlMaestroMultipleComboProjection;
    public fechaCancelacion?: any;
    public motivoCancelacion?: ControlMaestroMultipleComboProjection;
    public banco?: string;
    public beneficiario?: string;
    public numeroCuenta?: string;
    public clabe?: string;
    public telefonoContacto?: string;
    public importeReembolsar?: number;
    public tipoCancelacion?: ControlMaestroMultipleComboProjection;
    public estatus?: ControlMaestroMultipleComboProjection;
    public fechaModificacion?: any;
    public detalles?: OrdenVentaCancelacionDetalleEditarProjection[];
    public archivos?: OrdenVentaCancelacionArchivoEditarProjection[];

    constructor() {
        this.id = null;
        this.codigo = null;
        this.tipoMovimiento = null;
        this.fechaDevolucion = null;
        this.motivoDevolucion = null;
        this.fechaCancelacion = null;
        this.motivoCancelacion = null;
        this.banco = null;
        this.beneficiario = null;
        this.numeroCuenta = null;
        this.clabe = null;
        this.telefonoContacto = null;
        this.importeReembolsar = null;
        this.tipoCancelacion = null;
        this.estatus = null;
        this.fechaModificacion = null;
        this.detalles = [];
        this.archivos = [];
    }
}

export class OrdenVentaCancelacionListadoProjection {

    public id?: number;
    public codigo?: string;
    public ordenVenta?: string;
    public sucursal?: string;
    public fechaCancelacion?: any;
    public importeReembolsar?: number;
    public creadoPor?: string;
    public estatus?: string;
    public archivos?: number;
}