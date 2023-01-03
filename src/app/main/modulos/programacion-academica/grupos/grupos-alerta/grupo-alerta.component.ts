import { Component, ViewEncapsulation  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { TranslateService } from '@ngx-translate/core';
import { HashidsService } from '@services/hashids.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GrupoAlertasService } from './grupo-alerta.service';

@Component({
    selector: 'grupo-alerta',
    templateUrl: './grupo-alerta.component.html',
    styleUrls: ['./grupo-alerta.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class GrupoAlertaComponent {

    pageType: string = 'alerta';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    form = new FormGroup({});

    apiUrl: string = environment.apiUrl;
    
    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;
    nota: string;
    sede: string;
    fecha: Date;
    usuario: string;
    inscripcion: any;
    grupo: any;

    alumnos: any[];
    inscripciones: any[];

    constructor(
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _grupoAlertaService: GrupoAlertasService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");
            this.currentId = this.hashid.decode(id);
            this.config = {
                rutaAtras: "/app/compras/listado-alertas",
                rutaRechazar: "/api/v1/grupos/multisede/rechazar",
                rutaAprobar:  "/api/v1/grupos/multisede/aprobar",
                icono: "book"
            }

        });

        this._grupoAlertaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if(data){
                    this.alumnos = [];
                    this.inscripciones = [];
                    this.titulo = data?.nota;
                    this.nota = data?.nota;
                    this.sede = data?.sede;
                    this.fecha = new Date(data?.fecha);
                    this.usuario = data?.usuario;
                    this.inscripcion = data?.inscripcion;
                    this.inscripcion.alumnoId = data?.inscripcion?.alumno?.id;
                    this.inscripcion.grupo = data?.grupo;
                    this.inscripcion.grupo.horario = JSON.parse(data?.grupo?.horario)[0]?.horario;

                    this.alumnos = [data?.inscripcion?.alumno];
                    this.inscripciones[this.alumnos[0].id] = [this.inscripcion];
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}