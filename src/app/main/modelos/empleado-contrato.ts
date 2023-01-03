import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { DepartamentoComboProjection } from "@models/departamento";
import { UsuarioComboProjection } from "@models/usuario";
import { EmpleadoEditarProjection } from "./empleado";
import { EstadoComboProjection } from "./estado";
import { ControlesMaestrosMultiples } from "./mapeos/controles-maestros-multiples";
import { MunicipioComboProjection } from "./municipio";
import { PaisComboProjection } from "./pais";
import { PuestoComboContratosProjection } from "./puesto";

export class EmpleadoContratoEditarProjection{
    public id?: number;
    public empleadoId?: number;
    public codigo?: string;
    public justificacion?: ControlMaestroMultipleComboProjection;
    public tipoContrato?: ControlMaestroMultipleComboProjection;
    public puesto?: PuestoComboContratosProjection;
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
    public fechaContrato?: Date;
    public estatusId?: number;
    public propositoPuesto?: String;

    constructor(empleadoContrato?){
        empleadoContrato = empleadoContrato || {};
        this.id = empleadoContrato.id || null;
        this.empleadoId = empleadoContrato.empleadoId || null;
        this.codigo = empleadoContrato.codigo || '';
        this.justificacion = empleadoContrato.justificacion || null;
        this.tipoContrato = empleadoContrato.justificacion || null;
        this.puesto = empleadoContrato.puesto || null;
        this.ingresosAdicionales = empleadoContrato.ingresosAdicionales || '';
        this.sueldoMensual = empleadoContrato.sueldoMensual || null;
        this.fechaInicio = empleadoContrato.fechaInicio || null;
        this.fechaFin = empleadoContrato.fechaFin || null;
        this.tipoHorario = empleadoContrato.tipoHorario || null;
        this.cantidadHoraSemana = empleadoContrato.cantidadHoraSemana || null;
        this.domicilio = empleadoContrato.domicilio || '';
        this.cp = empleadoContrato.cp || '';
        this.colonia = empleadoContrato.colonia || '';
        this.pais = empleadoContrato.pais || null;
        this.estado = empleadoContrato.estado || null;
        this.municipio = empleadoContrato.municipio || null;
        this.fechaContrato = empleadoContrato.fechaContrato || null;
        this.estatusId = empleadoContrato.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.ACTIVO;
        this.propositoPuesto = empleadoContrato.propositoPuesto || null;
    }
}

export class EmpleadoContratoComboEmpleadoProjection{
    public id?: number;
    public nombreCompleto?: string;
}

export class EmpleadoContratoEmpleadoProjection{
    public id?: number;
    public empleadoId?: number;
    public empleado?: EmpleadoEditarProjection;
    public codigo?: string;
    public justificacionId?: number;
    public tipoContratoId?: number;
    public tipoContrato?: ControlMaestroMultipleComboProjection;
    public puestoId?: number;
    public ingresosAdicionales?: string;
    public sueldoMensual?: number;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public tipoHorarioId?: number;
    public cantidadHoraSemana?: number;
    public domicilio?: string;
    public cp?: string;
    public colonia?: string;
    public paisId?: number;
    public estadoId?: number;
    public municipioId?: number;
    public fechaContrato?: Date;
    public estatusId?: number;
    public propositoPuesto?: String;
}