import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TranslateModule } from '@ngx-translate/core';
import { PixvsConfirmComentarioDialogComponent } from './confirm-comentario-dialog.component';

@NgModule({
    declarations: [
        PixvsConfirmComentarioDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule,
		MatSnackBarModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,

        TranslateModule
        
    ],
    entryComponents: [
        PixvsConfirmComentarioDialogComponent
    ],
})
export class PixvsConfirmComentarioDialogModule
{
}
