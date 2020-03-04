import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, startWith} from 'rxjs/operators';
import {PageEvent} from '@angular/material/paginator';

export interface Image {
  title: string;
  url: string;
  date: string;
}
export type PageSize = 5 | 10 | 15 | 20;
const PAGE_SIZE_OPTIONS: PageSize[] = [5, 10, 15, 20];
interface Paging {
  pageIndex: number;
  pageSize: number;
}

function extractPageFromResults(pageIndex: number, pageSize: number, results: Image[]){
  const start = (pageIndex) * pageSize;
  const end = start + pageSize;
  return results.slice(start, end);
}

@Component({
  selector: 'my-gallery',
  templateUrl: './my-gallery.component.html',
  styleUrls: ['./my-gallery.component.css']
})
export class MyGalleryComponent implements OnInit {
  @Input() public readonly pagination: boolean = true;
  @Input() public readonly resultsPerPage: PageSize = 10;
  @Input() private readonly feed: string | Image[];
  public images$: Observable<Image[]>;
  public currentVisibleImages$: Observable<Image[]>;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  private pagingSubject = new Subject<Paging>();
  private paging$: Observable<Paging> = this.pagingSubject.asObservable().pipe(
    startWith({
      pageIndex: 0,
      pageSize: this.resultsPerPage,
    })
  );
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
    this.currentVisibleImages$ = combineLatest([this.images$, this.paging$]).pipe(
      map(([allImages, paging]) =>
        extractPageFromResults(paging.pageIndex, paging.pageSize, allImages)
      )
    );
  }
  public onPageEvent(pageEvent: PageEvent){
    this.pagingSubject.next(pageEvent);
  }
}
