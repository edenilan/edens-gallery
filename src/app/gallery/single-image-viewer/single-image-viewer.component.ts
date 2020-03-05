import {Component, Inject} from '@angular/core';
import {Image} from "../my-gallery.types";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Observable, Subject} from 'rxjs';
import {map, scan, startWith} from 'rxjs/operators';

type Direction = "left" | "right";

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
  private readonly arrowClickSubject = new Subject<Direction>();
  public readonly currentImageIndex$: Observable<number> = this.arrowClickSubject.pipe(
      scan((acc, curr) =>
        (curr === "left") ? acc - 1 : acc + 1, this.data.currentImageIndex
      ),
    startWith(this.data.currentImageIndex)
    );
  public image$: Observable<Image> = this.currentImageIndex$.pipe(
    map((index) => this.data.images[index])
  );
  constructor(@Inject(MAT_DIALOG_DATA) public data: SingleImageViewerData) {  }

  public arrowClicked(direction: "left" | "right") {
    this.arrowClickSubject.next(direction);
  }
}
