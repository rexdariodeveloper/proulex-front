import { TranslateService, TranslateParser } from "@ngx-translate/core";
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english_general } from '@pixvs/traducciones/i18n/en';
import { locale as spanish_general } from '@pixvs/traducciones/i18n/es';


@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
  translate: TranslateService;
  loader: FuseTranslationLoaderService;

  itemsPerPageLabel = 'Items per page';
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  getRangeLabel = function (page, pageSize, length) {
    const of = this.translate ? this.translate.instant('PAGINATOR.OF') : 'of';
    if (length === 0 || pageSize === 0) {
      return '0 ' + of + ' ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
  };

  injectTranslateService(translate: TranslateService, loader: FuseTranslationLoaderService) {
    this.translate = translate;
    this.loader = loader;
    this.loader.loadTranslations(english_general, spanish_general);

    this.translate.onLangChange.subscribe(() => {
      this.translateLabels();
      this.changes.next();
    });

    this.translateLabels();
  }

  translateLabels() {
    this.itemsPerPageLabel = this.translate.instant('PAGINATOR.ITEMS_PER_PAGE');
    this.nextPageLabel = this.translate.instant('PAGINATOR.NEXT_PAGE');
    this.previousPageLabel = this.translate.instant('PAGINATOR.PREVIOUS_PAGE');
  }

}