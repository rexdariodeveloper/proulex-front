import { OrdenVentaCancelacion } from "./orden-venta-cancelacion";
import { OrdenVentaDetalle } from "./orden-venta-detalle";

export class OrdenVentaCancelacionDetalle {

    public id?: number;
    public ordenVentaCancelacion?: OrdenVentaCancelacion;
    public ordenVentaCancelacionId?: number;
    public ordenVentaDetalle?: OrdenVentaDetalle;
    public ordenVentaDetalleId?: number;
    public regresoLibro?: number;

}

export class OrdenVentaCancelacionDetalleEditarProjection {

    public id?: number;
    public ordenVentaDetalleId?: number;
    public regresoLibro?: number;

}