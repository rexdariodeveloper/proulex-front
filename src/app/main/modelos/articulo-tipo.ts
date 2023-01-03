import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';

export class ArticuloTipo {
	public id?: number;
	public tipo?: ControlMaestroMultiple;
	public tipoId?: number;
	public descripcion?: string;
	public activo?: boolean;
}

export class ArticuloTipoComboProjection {
	id: number;
	descripcion: string;
}