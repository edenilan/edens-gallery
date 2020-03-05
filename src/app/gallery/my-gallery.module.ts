import {NgModule} from '@angular/core';
import { MyGalleryComponent } from './my-gallery.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    MatPaginatorModule,
    MatSelectModule,
  ],
  exports: [MyGalleryComponent],
  declarations: [MyGalleryComponent],
  providers: [],
})
export class MyGalleryModule {
}
