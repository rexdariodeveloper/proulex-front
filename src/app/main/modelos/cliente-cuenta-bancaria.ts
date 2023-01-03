import { Banco } from "./banco";

export class ClienteCuentaBancaria {
	
    public id?: number;
    public clienteId?: number;
    public bancoId?: number;
    public banco?: Banco;
    public cuenta?: string;
    public activo?: boolean;
}