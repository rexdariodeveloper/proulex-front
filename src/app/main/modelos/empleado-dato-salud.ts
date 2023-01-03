import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";

export class EmpleadoDatoSaludEditarProjection{
	public id?: number;
    public empleadoId?: number;
    public alergias?: string;
    public padecimientos?: string;
    public informacionAdicional?: string;
    public tipoSangre?: ControlMaestroMultipleComboProjection;

    constructor(empleadoDatoSalud?){
        empleadoDatoSalud = empleadoDatoSalud || {};
        this.id = empleadoDatoSalud.id || null;
        this.empleadoId = empleadoDatoSalud.empleadoId || null;
        this.alergias = empleadoDatoSalud.alergias || '';
        this.padecimientos = empleadoDatoSalud.padecimientos || '';
        this.informacionAdicional = empleadoDatoSalud.informacionAdicional || '';
        this.tipoSangre = empleadoDatoSalud.tipoSangre || null;
    }
}