import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";
import { SolicitudRenovacionContratacionDetalleEditarProjection } from "./solicitud-renovacion-contratacion-detalle";

export class SolicitudRenovacionContratacionEditarProjection {
    public id?: number;
    public codigo?: string;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public listaSolicitudRenovacionContratacionDetalle?: SolicitudRenovacionContratacionDetalleEditarProjection[];

    constructor(solicitud?){
        solicitud = solicitud || {};
        this.id = solicitud.id || null;
        this.codigo = solicitud.codigo || '';
        this.fechaInicio = solicitud.fechaInicio || null;
        this.fechaFin = solicitud.fechaFin || null;
        this.estatusId = solicitud.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO;
        this.fechaCreacion = solicitud.fechaCreacion || null;
        this.listaSolicitudRenovacionContratacionDetalle = solicitud.listaSolicitudRenovacionContratacionDetalle || [];
    }
}