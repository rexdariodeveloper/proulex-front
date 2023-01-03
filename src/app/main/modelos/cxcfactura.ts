import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { SATMesComboProjection } from "@models/sat-mes";
import { SATPeriodicidadComboProjection } from "@models/sat-periodicidad";
import { SATRegimenFiscal } from "@models/sat-regimen-fiscal";
import { SATUsoCFDIComboProjection } from "@models/sat-uso-cfdi";
import { Usuario } from "@models/usuario";
import { CXCFacturaDetalle } from "./cxcfactura-detalle";
import { CXCPago } from "./cxcpago";
import { CXCPagoDetalle } from "./cxcpago-detalle";
import { DatosFacturacion } from "./datos-facturacion";
import { FormaPagoComboProjection } from "./FormaPago";
import { MonedaComboProjection } from "./moneda";
import { Sucursal } from "./sucursal";

export class CXCFactura {

    public id?: number;
    public version?: string;
    public fecha?: Date;
    public serie?: string;
    public folio?: string;
    public formaPago?: FormaPagoComboProjection;
    public formaPagoId?: number;
    public diasCredito?: number;
    public condicionesPago?: string;
    public moneda?: MonedaComboProjection;
    public monedaId?: number;
    public tipoCambio?: number;
    public metodoPago?: ControlMaestroMultiple;
    public metodoPagoId?: number;
    public emisorCP?: string;
    public emisorRFC?: string;
    public emisorRazonSocial?: string;
    public emisorRegimenFiscal?: SATRegimenFiscal;
    public emisorRegimenFiscalId?: number;
    public receptorCP?: string;
    public receptorRFC?: string;
    public receptorNombre?: string;
    public receptorRegimenFiscal?: SATRegimenFiscal;
    public receptorRegimenFiscalId?: number;
    public receptorUsoCFDI?: SATUsoCFDIComboProjection;
    public receptorUsoCFDIId?: number;
    public uuid?: string;
    public xml?: string;
    public tipoRegistro?: ControlMaestroMultiple;
    public tipoRegistroId?: number;
    public datosFacturacionId?: number;
    public datosFacturacion?: DatosFacturacion;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public periodicidad?: SATPeriodicidadComboProjection;
    public periodicidadId?: number;
    public mes?: SATMesComboProjection;
    public mesId?: number;
    public anio?: number;
    public tipoRelacionId?: number;
    public tipoRelacion?: ControlMaestroMultiple;
    public fechaCancelacion?: Date;
    public motivoCancelacionId?: number;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaModificacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;

    public detalles?: CXCFacturaDetalle[];
    public facturasRelacionadas?: CXCFactura[];

    public pago?: CXCPago;
    public pagos?: CXCPagoDetalle[];

    public total?: number;

    public metodoPagoTemp?: string;
    public timbrar?: boolean;
    
    public fechaRegistro?: any;
    public fechaEmbarque?: any;
    public paridadOficial?: number;
    public paridadUsuario?: number;
    public montoRegistro?: number;
    public fechaPago?: any;
    public comentarios?: string;
    public tipoPago?: ControlMaestroMultiple;
    public tipoPagoId?: number;

    public serieFolio?: string = (this.serie ? this.serie + ' ' : '') + this.folio;
}