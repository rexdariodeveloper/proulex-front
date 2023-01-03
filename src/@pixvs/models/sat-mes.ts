import { SATPeriodicidadComboProjection } from "./sat-periodicidad";

export class SATMes {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public activo?: boolean;
}

export class SATMesComboProjection {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public activo?: boolean;
    public valor?: string;
    public periodicidad?: SATPeriodicidadComboProjection;
}