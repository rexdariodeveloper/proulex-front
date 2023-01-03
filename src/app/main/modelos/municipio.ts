import { Estado } from "./estado";

export class Municipio {

    public id?: number;
    public estado?: Estado;
    public estadoId?: number;
    public nombre?: string;
    public claveMunicipio?: string;

}

export class MunicipioComboProjection {

    public id?: number;
    public nombre?: string;

}