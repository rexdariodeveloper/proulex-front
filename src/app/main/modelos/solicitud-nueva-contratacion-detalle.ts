import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { EmpleadoEditarProjection } from "./empleado";
import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";

export class SolicitudNuevaContratacionDetalleEditarProjection {
	public id?: number;
    public solicitudNuevaContratacionId?: number;
    public empleado?: EmpleadoEditarProjection;
    public estatusId?: number;

    constructor(solicitud?){
        solicitud = solicitud || {};
        this.id = solicitud.id || null;
        this.solicitudNuevaContratacionId = solicitud.solicitudNuevaContratacionId || null;
        this.empleado = solicitud.empleado || null;
        this.estatusId = solicitud.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO;
    }
}