import { Articulo, ArticuloComboListaPreciosProjection, ArticuloComboProjection } from "./articulo";
import { ClienteRemision } from "./cliente-remision";

export class ClienteRemisionDetalle {

    public id?: number;
    public clienteRemision?: ClienteRemision;
    public clienteRemisionId?: number;
    public articulo?: Articulo;
    public articuloId?: number;
    public cantidad?: number;

}

export class ClienteRemisionDetalleEditarProjection {

    public id?: number;
    public articulo?: ArticuloComboListaPreciosProjection;
    public cantidad?: number;

    // Campos para usar solo en front
    public idTmp: number;

}

export class ClienteRemisionDetalleFacturarProjection {

    public id?: number;
    public clienteRemisionId?: number;
    public articuloNombre?: string;
    public unidadMedidaNombre?: string;
    public cantidad?: number;
    public precioUnitario?: number;

    // Campos para usar solo en front
    public iepsCuotaFijaChk: boolean;
    public cantidadRelacionar: number;

}