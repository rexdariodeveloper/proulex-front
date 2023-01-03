import { PuestoHabilidadResponsabilidad } from './puesto-habilidad-responsabilidad';

export class Puesto{

    public id?: number;
    public codigo?: string;
	public nombre?: string;
    public habilidadesResponsabilidades?: PuestoHabilidadResponsabilidad[];

}