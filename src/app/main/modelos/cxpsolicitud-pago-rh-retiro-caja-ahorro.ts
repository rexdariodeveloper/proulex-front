import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

export class CXPSolicitudPagoRHRetiroCajaAhorro{
	public id?: number;
    public cpxSolicitudPagoRhId?: number;
    public tipoRetiro?: ControlMaestroMultipleComboProjection;
    public tipoRetiroId?: number;
    public ahorroAcumulado?: number;
    public cantidadRetirar?: number;
    public motivoRetiro?: string;	
}

export class CXPSolicitudPagoRHRetiroCajaAhorroEditarProjection{
	public id?: number;	
	public cpxSolicitudPagoRhId?: number;
	public tipoRetiro?: ControlMaestroMultipleComboProjection;
	public ahorroAcumulado: number;
    public cantidadRetirar: number;
    public motivoRetiro: string;
}

