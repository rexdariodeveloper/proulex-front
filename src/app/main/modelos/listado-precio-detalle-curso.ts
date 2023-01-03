import { Articulo } from "./articulo";
import { ListadoPrecioDetalle } from "./listado-precio-detalle";

export class ListadoPrecioDetalleCurso {

    public id?: number;
    public listadoPrecioDetalle?: ListadoPrecioDetalle;
    public listadoPrecioDetalleId?: number;
    public precio?: number;
    public articulo?: Articulo;
    public articuloId?: number;

}