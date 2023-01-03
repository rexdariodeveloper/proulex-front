import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { Tabulador, TabuladorEditarProjection } from './tabulador';

export class DeduccionPercepcion{
	public id?: number;
    public codigo?: string;
    public tipo?: ControlMaestroMultiple;
    public tipoId?: number;
    public concepto?: string;
    public tabulador?: Tabulador;
    public tabuladorId?: number;
    public porcentaje?: number;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
}

export class DeduccionPercepcionEditarProjection{
	public id?: number;
    public codigo?: string;
    public tipo?: ControlMaestroMultiple;
    public concepto?: string;
    public tabulador?: Tabulador;
    public porcentaje?: number;
    public activo?: boolean;
}

export class DeduccionComboProjection{
	public id?: number;
	public codigo?: string;
	public porcentaje?: number;
}