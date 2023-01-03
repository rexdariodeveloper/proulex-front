import { SATRegimenFiscal, SATRegimenFiscalComboProjection } from "./sat-regimen-fiscal";

export class SATUsoCFDI {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public fisica?: boolean;
    public moral?: boolean;
    public activo?: boolean;
    public regimenesFiscales?: SATRegimenFiscal[];
}

export class SATUsoCFDIComboProjection {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public fisica?: boolean;
    public moral?: boolean;
    public activo?: boolean;
    public valor?: string;
    public regimenesFiscales?: SATRegimenFiscalComboProjection[];
}