import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { EmpleadoContratoEmpleadoProjection } from "./empleado-contrato";
import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";

export class SolicitudBajaContratacionEditarProjection {
    public id?: number;
    public codigo?: string;
    public empleadoContrato?: EmpleadoContratoEmpleadoProjection;
    public tipoMotivo?: ControlMaestroMultipleComboProjection;
    public fechaSeparacion?: Date;
    public comentario?: string;
    public estatusId?: number;

    constructor(solicitud?){
        solicitud = solicitud || {};
        this.id = solicitud.id || null;
        this.codigo = solicitud.codigo || '';
        this.empleadoContrato = solicitud.empleadoContrato || new EmpleadoContratoEmpleadoProjection();
        this.tipoMotivo = solicitud.tipoMotivo || ControlMaestroMultipleComboProjection;
        this.fechaSeparacion = solicitud.fechaSeparacion || null;
        this.comentario = solicitud.comentario || '';
        this.estatusId = solicitud.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO;
    }
}