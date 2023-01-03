import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { LogTipo } from '@models/mapeos/log-tipo';

@Component({
    selector: 'solicitud-historial',
    templateUrl: 'solicitud-historial.component.html',
})
export class SolicitudPagoProveedoresHistorialComponent {

    timeline = {
    };

    constructor(private _historial: MatBottomSheetRef<SolicitudPagoProveedoresHistorialComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public historial: any) { debugger; }

    openLink(event: MouseEvent): void {
        this._historial.dismiss();
        event?.preventDefault();
    }
}