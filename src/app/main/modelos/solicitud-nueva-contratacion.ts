import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";
import { SolicitudNuevaContratacionDetalleEditarProjection } from "./solicitud-nueva-contratacion-detalle";

export class SolicitudNuevaContratacionEditarProjection {
    public id?: number;
    public codigo?: string;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public listaSolicitudNuevaContratacionDetalle?: SolicitudNuevaContratacionDetalleEditarProjection[];

    constructor(solicitud?){
        solicitud = solicitud || {};
        this.id = solicitud.id || null;
        this.codigo = solicitud.codigo || '';
        this.estatusId = solicitud.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO;
        this.fechaCreacion = solicitud.fechaCreacion || null;
        this.listaSolicitudNuevaContratacionDetalle = solicitud.listaSolicitudNuevaContratacionDetalle || [];
    }
}