import { ArchivoProjection } from "./archivo";

export class ControlMaestroMultiple {
	public id?: number;
	public nombre?: string;
	public valor?: string;
	public referencia?: string;
}

export class ControlMaestroMultipleProjection {
	public id?: number;
	public valor?: string;
}

export class ControlMaestroMultipleComboProjection {

	id?: number;
    control?: string;
    valor?: string;
    referencia?: string;
    cmmReferencia?: ControlMaestroMultipleComboProjection;
}

export class ControlMaestroMultipleCardProjection {

	id?: number;
    control?: string;
    valor?: string;
    referencia?: string;
    orden?: number;
    imagenId?: number;

}

export class ControlMaestroMultipleComboSimpleProjection {

    id?: number;
    valor?: string;
    referencia?: string;

}