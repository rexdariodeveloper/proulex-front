export enum EnumAgrupadoresListadosPrecios {
    MODALIDAD,
    MODALIDAD_Y_TIPO_GRUPO
}

export class AgrupadorListadoPrecio {
    id: EnumAgrupadoresListadosPrecios;
    nombre: string;
}