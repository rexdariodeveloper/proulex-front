import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Archivo, ArchivoProjection } from '@models/archivo';

export class EntidadContrato {
	public id?: number;
    public entidadId?: number;
    public tipoContrato?: ControlMaestroMultiple;
    public tipoContratoId?: number;
    public documentoContrato?: Archivo;
    public documentoContratoId?: number;
    public adendumContrato?: Archivo;
    public adendumContratoId?: number;
    public activo?: boolean;
}

export class EntidadContratoEditarProjection {
	public id?: number;
    public entidadId?: number;	
    public tipoContrato?: ControlMaestroMultiple;
    public documentoContrato?: ArchivoProjection;
    public adendumContrato?: ArchivoProjection;
    public activo?: boolean;
}