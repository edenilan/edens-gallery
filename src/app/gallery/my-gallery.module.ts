import {NgModule} from '@angular/core';
import { MyGalleryComponent } from './my-gallery.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    MatPaginatorModule,
  ],
  exports: [MyGalleryComponent],
  declarations: [MyGalleryComponent],
  providers: [],
})
export class MyGalleryModule {
}
