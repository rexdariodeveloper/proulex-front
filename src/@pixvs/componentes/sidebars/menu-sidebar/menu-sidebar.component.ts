import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';

export class PixvsMenuSidebarSeccion<T> {
    nombre?: string;
    menus: PixvsMenuSidebarMenu<T>[];
}

export class PixvsMenuSidebarMenu<T> {
    id: number|string;
    nombre: string;
    icono?: string;
    objeto: T;
}

@Component({
    selector     : 'pixvs-menu-sidebar',
    templateUrl  : './menu-sidebar.component.html',
    styleUrls    : ['./menu-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class PixvsMenuSidebarComponent implements OnInit, OnDestroy {

    // @Inputs()
    @Input() secciones: PixvsMenuSidebarSeccion<any>[];
    @Input() seleccionInicial: PixvsMenuSidebarMenu<any>;

    // @Outputs()
    @Output() onMenu: EventEmitter<any> = new EventEmitter();

    // Public
    menuSeleccionado: PixvsMenuSidebarMenu<any> = null;
    
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
    ){

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        console.log('ngOnInit');
    }

    /**
     * On changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.seleccionInicial){
            this.seleccionInicial = changes.seleccionInicial.currentValue;
        }
        if(changes?.secciones){
            this.secciones = changes.secciones.currentValue;
            if(this.seleccionInicial){
                this.onMenuClick(this.seleccionInicial);
            }
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onMenuClick(menu: PixvsMenuSidebarMenu<any>) {
        this.menuSeleccionado = menu;
        this.onMenu.emit(menu.objeto);
    }
}
