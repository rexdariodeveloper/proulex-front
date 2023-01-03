import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { Cliente } from "./cliente";
import { MedioPagoPV } from "./medio-pago-pv";
import { Moneda } from "./moneda";
import { OrdenVentaDetalle } from "./orden-venta-detalle";
import { Sucursal } from "./sucursal";

export class OrdenVenta {

    public id?: number;
    public codigo?: string;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public cliente?: Cliente;
    public clienteId?: number;
    public fechaOV?: any;
    public fechaRequerida?: any;
    public direccionOV?: string;
    public enviarA?: string;
    public moneda?: Moneda;
    public monedaId?: number;
    public diazCredito?: number;
    public medioPagoPV?: MedioPagoPV;
    public medioPagoPVId?: number;
    public referenciaPago?: string;
    public comentario?: string;
    public tipoCambio?: number;
    public monedaSinConvertir?: Moneda;
    public monedaSinConvertirId?: number;
    
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    
    public fechaCreacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: any;
    public fechaPago?: any;
    
    public detalles?: OrdenVentaDetalle[];

    // Propiedades para manejo del punto de venta
    public plantelId?: number;
    public listaPreciosId?: number;
    public correoElectronico: string;
    public monto: number;
    public marcarEntregaPendienteInscripciones: boolean;

}

export class OrdenVentaHistorialPVProjection {

    public id?: number;
    public fecha?: any;
    public codigo?: string;
    public monto?: number;
    public estatusId?: number;
    public estatus?: string;

}

export class OrdenVentaHistorialPVResumenProjection {

    public id?: number;
    public codigo?: string;
    public usuario?: string;
    public fecha?: any;
    public montoTotal?: number;
    public medioPago?: string;

}

export class FacturacionNotaVentaProjection {

    public id?: number;
    public fecha?: any;
    public codigo?: string;
    public subtotal?: number;
    public descuento?: number;
    public impuestos?: number;
    public total?: number;
    public sucursalId?: number;
    public estatusId?: number;
}

export class FacturacionGlobalNotaVentaProjection {

    public id?: number;
    public cantidad?: number;
    public claveProdServ?: string;
    public noIdentificacion?: string;
    public descripcion?: string;
    public valorUnitario?: number;
    public subtotal?: number;
    public descuento?: number;
    public impuestos?: number;
    public total?: number;
    public sucursalId?: number;
    public estatusId?: number;

    public impuestosDetalles? : FacturacionGlobalImpuestosNotaVentaProjection[];
}

export class FacturacionGlobalImpuestosNotaVentaProjection {

    public id?: number;
    public clave?: string;
    public tipoFactor?: string;
    public base?: number;
    public tasaOCuota?: number;
    public importe?: number;
    public ordenVentaId?: number;
}

export class OrdenVentaSimpleProjection {

    public id?: number;
    public codigo?: string;
    public fechaOV?: Date;
    public fechaRequerida?: Date;
}