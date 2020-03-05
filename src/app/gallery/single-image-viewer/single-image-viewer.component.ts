import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {Image} from "../my-gallery.types";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

export interface SingleImageViewerData {
  images: Image[];
  currentImageIndex: number;
}
@Component({
  selector: 'single-image-viewer',
  templateUrl: './single-image-viewer.component.html',
  styleUrls: ['./single-image-viewer.component.css']
})
export class SingleImageViewerComponent {
  public image: Image = this.data.images[this.data.currentImageIndex];
  constructor(@Inject(MAT_DIALOG_DATA) public data: SingleImageViewerData) {  }
}
