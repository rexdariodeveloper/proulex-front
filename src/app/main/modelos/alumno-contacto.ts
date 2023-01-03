import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Alumno } from "./alumno";

export class AlumnoContacto {

    public id?: number;
    public alumno?: Alumno;
    public alumnoId?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public parentesco?: ControlMaestroMultiple;
    public parentescoId?: number;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public correoElectronico?: string;

}

export class AlumnoContactoEditarProjection {

    public id?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public parentesco?: ControlMaestroMultipleComboProjection;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public correoElectronico?: string;

    // Campos para usar solo en front
    public idTmp: number;

}