import { Usuario } from "@models/usuario";
import { Articulo } from "./articulo";
import { OrdenVenta, OrdenVentaSimpleProjection } from "./orden-venta";
import { UnidadMedida } from "./unidad-medida";

export class OrdenVentaDetalle {

    public id?: number;
    public ordenVenta?: OrdenVenta;
    public ordenVentaId?: number;
    public articulo?: Articulo;
    public articuloId?: number;
    public unidadMedida?: UnidadMedida;
    public unidadMedidaId?: number;
    public factorConversion?: number;
    public cantidad?: number;
    public precio?: number;
    public precioSinConvertir?: number;
    public descuento?: number;
    public descuentoSinConvertir?: number;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public cuentaOV?: string;
    public comentarios?: string;
    
    public fechaCreacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: any;

}

export class OrdenVentaDetalleHistorialPVResumenProjection {

    public id?: number;
    public conceptoLinea1?: string;
    public conceptoLinea2?: string;
    public cantidad?: number;
    public precio?: number;
    public descuento?: number;
    public montoTotal?: number;
    public esExamenUbicacion: boolean;
    public esInscripcion: boolean;

}

export class OrdenVentaDetalleReferenciaOVProjection {

    public id?: number;
    public ordenVenta?: OrdenVentaSimpleProjection;
    public ordenVentaId?: number;

}