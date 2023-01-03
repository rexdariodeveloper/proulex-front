import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

export class EmpleadoBeneficiario {
	public id?: number;
    public empleadoId?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public parentesco?: ControlMaestroMultiple;
    public parentescoId?: number;
    public porcentaje?: number;
}

export class EmpleadoBeneficiarioEditarProjection{
	public id?: number;
    public empleadoId?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public parentesco?: ControlMaestroMultipleComboProjection;
    public porcentaje?: number;
}