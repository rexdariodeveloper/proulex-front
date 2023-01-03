import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';
import { Usuario } from '@models/usuario';


@Component({
    selector: 'perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PerfilComponent {
    public usuario: Usuario;
    /**
     * Constructor
     */
    constructor() {

    }

    ngOnInit(): void {
        this.usuario = JSON.parse(localStorage.getItem('usuario'));
    }
}
