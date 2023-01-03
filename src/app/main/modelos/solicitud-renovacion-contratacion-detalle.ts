import { EmpleadoEditarProjection } from "./empleado";
import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";

export class SolicitudRenovacionContratacionDetalleEditarProjection {
	public id?: number;
    public solicitudRenovacionContratacionId?: number;
    public empleadoId?: number;
    public empleado?: EmpleadoEditarProjection;
    public estatusId?: number;

    constructor(solicitud?){
        solicitud = solicitud || {};
        this.id = solicitud.id || null;
        this.solicitudRenovacionContratacionId = solicitud.solicitudRenovacionContratacionId || null;
        this.empleadoId = solicitud.empleadoId || null;
        this.empleado = solicitud.empleado || null;
        this.estatusId = solicitud.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO;
    }
}