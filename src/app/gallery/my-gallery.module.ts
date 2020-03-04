import {NgModule} from '@angular/core';
import { MyGalleryComponent } from './my-gallery.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  imports: [BrowserModule, CommonModule, HttpClientModule],
  exports: [MyGalleryComponent],
  declarations: [MyGalleryComponent],
  providers: [],
})
export class MyGalleryModule {
}
