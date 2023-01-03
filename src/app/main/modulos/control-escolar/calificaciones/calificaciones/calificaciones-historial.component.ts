import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { LogTipo } from '@models/mapeos/log-tipo';

@Component({
    selector: 'calificaciones-historial',
    templateUrl: 'calificaciones-historial.component.html',
})
export class CalificacionesHistorialComponent {

    timeline = {
    };

    constructor(private _historial: MatBottomSheetRef<CalificacionesHistorialComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public historial: any) { }

    openLink(event: MouseEvent): void {
        this._historial.dismiss();
        event?.preventDefault();
    }
}