import { SATUsoCFDI } from "./sat-uso-cfdi";

export class SATRegimenFiscal {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public fisica?: boolean;
    public moral?: boolean;
    public activo?: boolean;
    public usosCFDI?: SATUsoCFDI[];
}

export class SATRegimenFiscalComboProjection {

    public id?: number;
    public codigo?: string;
    public descripcion?: string;
    public fisica?: boolean;
    public moral?: boolean;
    public activo?: boolean;
}