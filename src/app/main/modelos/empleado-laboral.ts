import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { DepartamentoComboProjection } from "@models/departamento";
import { EstadoComboProjection } from "./estado";
import { MunicipioComboProjection } from "./municipio";
import { PaisComboProjection } from "./pais";

export class EmpleadoLaboralEditarProjection{
    public id?: number;
    public empleadoId?: number;
    public justificacion?: ControlMaestroMultipleComboProjection;
    public tipoContrato?: ControlMaestroMultipleComboProjection;
    public puesto?: DepartamentoComboProjection;
    public ingresosAdicionales?: string;
    public sueldoMensual?: number;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public tipoHorario?: ControlMaestroMultipleComboProjection;
    public cantidadHoraSemana?: number;
    public domicilio?: string;
    public cp?: string;
    public colonia?: string;
    public pais?: PaisComboProjection;
    public estado?: EstadoComboProjection;
    public municipio?: MunicipioComboProjection;

    constructor(empleadoLaboral?){
        empleadoLaboral = empleadoLaboral || {};
        this.id = empleadoLaboral.id || null;
        this.empleadoId = empleadoLaboral.empleadoId || null;
        this.justificacion = empleadoLaboral.justificacion || ControlMaestroMultipleComboProjection;
        this.tipoContrato = empleadoLaboral.tipoContrato || ControlMaestroMultipleComboProjection;
        this.puesto = empleadoLaboral.puesto || DepartamentoComboProjection;
        this.ingresosAdicionales = empleadoLaboral.ingresosAdicionales || '';
        this.sueldoMensual = empleadoLaboral.sueldoMensual || null;
        this.fechaInicio = empleadoLaboral.fechaInicio || null;
        this.fechaFin = empleadoLaboral.fechaFin || null;
        this.tipoHorario = empleadoLaboral.tipoHorario || ControlMaestroMultipleComboProjection;
        this.cantidadHoraSemana = empleadoLaboral.cantidadHoraSemana || null;
        this.domicilio = empleadoLaboral.domicilio || '';
        this.cp = empleadoLaboral.cp || '';
        this.colonia = empleadoLaboral.colonia || '';
        this.pais = empleadoLaboral.pais || null;
        this.estado = empleadoLaboral.estado || null;
        this.municipio = empleadoLaboral.municipio || null;
    }
}