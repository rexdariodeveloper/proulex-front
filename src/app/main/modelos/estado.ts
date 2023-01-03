import { Pais } from './pais';

export class Estado {
	public id?: number;
    public pais?: Pais;
    public paisId?: number;
    public nombre?: string;
    public claveEntidad?: string;
}

export class EstadoComboProjection {
	public id?: number;
    public nombre?: string;
}