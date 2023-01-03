/*******************************
Pasos para agregar el carrusel:
1.- Agregar el método a tu component
openDialog(): void {
        const dialogRef = this.dialog.open(CarouselImplementComponent, {
          width: '550px',
          height: '550px',
          data: this.slides //Este slides es tu array con formato [{src:'rutaArchivo'}]
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        });
    }

2.- Agregar el módulo import { CarouselModule } from '@pixvs/componentes/carousel/carousel.module';
3.- En tu componente exportar import { CarouselImplementComponent } from '@pixvs/componentes/carousel/carousel-implement.component';

**********************************/