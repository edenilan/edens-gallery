import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, startWith} from 'rxjs/operators';
import {PageEvent} from '@angular/material/paginator';
import {MatOptionSelectionChange} from '@angular/material/core/option/option';

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

enum SortingKey {
  NONE = "NONE",
  TITLE_ASC = "TITLE_ASC",
  TITLE_DESC = "TITLE_DESC",
  DATE_ASC = "DATE_ASC",
  DATE_DESC = "DATE_DESC"
}

interface SortingOption {
  sortingKey: SortingKey;
  displayValue: string;
}

function sortImages(images: Image[], sortingOption: SortingKey): Image[]{
  switch (sortingOption) {
    case SortingKey.NONE: {
      return images;
    }
    case SortingKey.TITLE_ASC: {
      return images.sort((a, b) => a.title.localeCompare(b.title));
    }
    case SortingKey.TITLE_DESC: {
      return images.sort((a, b) => b.title.localeCompare(a.title));
    }
    case SortingKey.DATE_ASC: {
      return images.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }
    case SortingKey.DATE_DESC: {
      return images.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    }
  }
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
  @Input() public sorting = true;
  @Input() private readonly feed: string | Image[];
  public images$: Observable<Image[]>;
  public currentVisibleImages$: Observable<Image[]>;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  public sortingOptions: SortingOption[] = [
    {
      sortingKey: SortingKey.TITLE_ASC,
      displayValue: "Title (A-Z)"
    },
    {
      sortingKey: SortingKey.TITLE_DESC,
      displayValue: "Title (Z-A)"
    },
    {
      sortingKey: SortingKey.DATE_DESC,
      displayValue: "Newest"
    },
    {
      sortingKey: SortingKey.DATE_ASC,
      displayValue: "Oldest"
    },
  ];
  private readonly pagingSubject = new Subject<Paging>();
  private paging$: Observable<Paging>;
  private readonly selectedSortingOptionSubject = new Subject<SortingKey>();
  private readonly selectedSortingOption$: Observable<SortingKey> = this.selectedSortingOptionSubject.asObservable().pipe(
    startWith(SortingKey.NONE)
  );
  private sortedImages$: Observable<Image[]>;
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
    this.paging$ = this.pagingSubject.asObservable().pipe(
      startWith({
        pageIndex: 0,
        pageSize: this.resultsPerPage,
      })
    );
    this.sortedImages$ = combineLatest([this.images$, this.selectedSortingOption$]).pipe(
      map(([images, selectedSortingOption]) => sortImages(images, selectedSortingOption))
    );
    this.currentVisibleImages$ = combineLatest([this.sortedImages$, this.paging$]).pipe(
      map(([sortedImages, paging]) =>
        extractPageFromResults(paging.pageIndex, paging.pageSize, sortedImages)
      )
    );
  }
  public onPageEvent(pageEvent: PageEvent){
    this.pagingSubject.next(pageEvent);
  }
  public onSortEvent(matOptionSelectionChange: MatOptionSelectionChange) {
    const option = matOptionSelectionChange.source;
    if (option.selected) {
      this.selectedSortingOptionSubject.next(option.value);
    }
  }
}
