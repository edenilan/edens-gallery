import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

export interface Image {
  title: string;
  url: string;
  date: string;
}

function extractPageFromResults(pageNumber: number, pageSize: number, results: Image[]){
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;
  return results.slice(start, end);
}

@Component({
  selector: 'my-gallery',
  templateUrl: './my-gallery.component.html',
  styleUrls: ['./my-gallery.component.css']
})
export class MyGalleryComponent implements OnInit {
  @Input() private readonly feed: string | Image[];
  @Input() private readonly resultsPerPage = 10;
  private images$: Observable<Image[]>;
  private currentVisibleImages$: Observable<Image[]>;
  private currentPageNumber = 1;
  constructor(private httpClient: HttpClient) {
  }
  ngOnInit(): void {
    this.initObservables();
  }
  private initObservables() {
    if (typeof this.feed === "string") {
      this.images$ = this.httpClient.get<Image[]>(this.feed);
    } else {
      this.images$ = of(this.feed);
    }
    this.currentVisibleImages$ = this.images$.pipe(
      map((allImages) =>
        extractPageFromResults(this.currentPageNumber, this.resultsPerPage, allImages)
      )
    );
  }


}
