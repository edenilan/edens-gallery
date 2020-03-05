import {NgModule} from '@angular/core';
import { MyGalleryComponent } from './my-gallery.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from "@angular/material/dialog";
import { SingleImageViewerComponent } from './single-image-viewer/single-image-viewer.component';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    MatPaginatorModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
  ],
  exports: [MyGalleryComponent],
  declarations: [MyGalleryComponent, SingleImageViewerComponent],
  providers: [],
  entryComponents: [SingleImageViewerComponent]
})
export class MyGalleryModule {
}
