import { ProgramaIdiomaEditarProjection } from "./programa-idioma";
import { ProgramaIdiomaCertificacionEditarProjection } from "./programa-idioma-certificacion";
import { ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection } from "./programa-idioma-certificacion-descuento-detlle";

export class ProgramaIdiomaCertificacionDescuentoEditarProjection{
    public id?: number;
    public programaIdiomaCertificacion?: ProgramaIdiomaCertificacionEditarProjection;
    public estatusId?: number;
    public listaDescuento?: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection[];
}