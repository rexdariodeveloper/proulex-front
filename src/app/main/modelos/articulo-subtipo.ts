import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';

export class ArticuloSubtipo {
	public id: number;
	public articuloTipoId: number;
	public descripcion: string;
	public activo: boolean;
}

export class ArticuloSubtipoComboProjection {
	id: number;
	descripcion: string;
}