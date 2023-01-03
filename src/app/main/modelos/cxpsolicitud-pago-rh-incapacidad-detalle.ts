import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

export class CXPSolicitudPagoRHIncapacidadDetalle {
	public id: number;
    public incapacidadId: number;
    public tipoId: number;
    public tipoMovimientoId: number;
    public salarioDiario: number;
    public porcentaje: number;
    public dias: number;
}

export class CXPSolicitudPagoRHIncapacidadDetalleEditarProjection {
	public id?: number;
    public incapacidadId?: number;
    public tipo?: ControlMaestroMultipleComboProjection;
    public tipoMovimiento?: ControlMaestroMultipleComboProjection;
    public salarioDiario?: number;
    public porcentaje?: number;
    public dias?: number;
}