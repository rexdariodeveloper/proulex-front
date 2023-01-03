import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { LogTipo } from '@models/mapeos/log-tipo';

@Component({
    selector: 'ficha-crud-historial',
    templateUrl: 'ficha-crud-historial.component.html',
})
export class FichaCrudHistorialComponent {

    timeline = {
    };

    constructor(private _historial: MatBottomSheetRef<FichaCrudHistorialComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public historial: any) { }

    openLink(event: MouseEvent): void {
        this._historial.dismiss();
        event?.preventDefault();
    }
}