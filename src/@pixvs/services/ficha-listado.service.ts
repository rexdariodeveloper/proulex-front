import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FichaListadoService {

    private rutaBuscadorLocalStorage: string = 'ficha-listado-buscador';
    private buscadorMap: {[ruta:string]: string} = {};
    private rutaFiltrosLocalStorage: string = 'ficha-listado-filtros';
    private filtrosMap: { url: string, filtros: any } = { url: '', filtros: {}};

    constructor() {
        let buscadorMap = localStorage.getItem(this.rutaBuscadorLocalStorage);
        if(!!buscadorMap){
            this.buscadorMap = JSON.parse(buscadorMap);
        }

        // let filtrosMap = localStorage.getItem(this.rutaFiltrosLocalStorage);
        // if(!!filtrosMap){
        //     this.filtrosMap = JSON.parse(filtrosMap);
        // }
    }

    getTextoBuscador(ruta: string){
        return this.buscadorMap[ruta] || '';
    }

    setTextoBuscador(ruta: string, textoBuscador: string){
        this.buscadorMap[ruta] = textoBuscador;
        localStorage.setItem(this.rutaBuscadorLocalStorage,JSON.stringify(this.buscadorMap));
    }

    getFiltros(ruta: string){
        let filtrosMap = localStorage.getItem(this.rutaFiltrosLocalStorage);
        if(!!filtrosMap){
            return JSON.parse(filtrosMap);
        }else{
            this.setFiltros(ruta, '');
            this.getFiltros(ruta);
        }
        return '';
    }

    setFiltros(ruta: string, filtros: any){
        this.filtrosMap = {
            url: ruta,
            filtros: filtros
        };
        localStorage.setItem(this.rutaFiltrosLocalStorage, JSON.stringify(this.filtrosMap));
    }

}
