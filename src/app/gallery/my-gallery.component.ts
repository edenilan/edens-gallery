import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {filter, map, scan, startWith, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatOptionSelectionChange} from '@angular/material/core/option/option';
import {MatDialog} from "@angular/material/dialog";
import {Image, PageSize} from "./my-gallery.types";
import {SingleImageViewerComponent, SingleImageViewerData} from "./single-image-viewer/single-image-viewer.component";

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

function sortImages(images: Image[], sortingOption: SortingKey): Image[] {
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

function extractPageFromResults(pageIndex: number, pageSize: number, results: Image[]) {
  const start = (pageIndex) * pageSize;
  const end = start + pageSize;
  return results.slice(start, end);
}

function isCurrentPageEmpty(paging: Paging, availableImages: Image[]): boolean {
  const {pageIndex, pageSize} = paging;
  return availableImages.length <= pageIndex * pageSize;
}
@Component({
  selector: 'my-gallery',
  templateUrl: './my-gallery.component.html',
  styleUrls: ['./my-gallery.component.css']
})
export class MyGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public readonly pagination: boolean = true;
  @Input() public readonly search: boolean = true;
  @Input() public readonly resultsPerPage: PageSize = 10;
  @Input() public sorting = true;
  @Input() private readonly feed: string | Image[];
  @ViewChild(MatPaginator) private readonly matPaginator;
  public availableImages$: Observable<Image[]>;
  public currentVisibleImages$: Observable<Image[]>;
  public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  private filterValueBS = new BehaviorSubject<string>("");
  public readonly filterValue$: Observable<string> = this.filterValueBS.asObservable();
  public set filterValue(value) {
    this.filterValueBS.next(value);
  }
  public get filterValue() {
    return this.filterValueBS.getValue();
  }
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
  private initialImages$: Observable<Image[]>;
  private readonly pagingSubject = new Subject<Paging>();
  private paging$: Observable<Paging>;
  private readonly selectedSortingOptionSubject = new Subject<SortingKey>();
  private readonly selectedSortingOption$: Observable<SortingKey> = this.selectedSortingOptionSubject.asObservable().pipe(
    startWith(SortingKey.NONE)
  );
  private readonly imageDeletedSubject = new Subject<Image>();
  private readonly deletedImages$: Observable<Image[]> = this.imageDeletedSubject.asObservable().pipe(
    scan((acc, curr) => [...acc, curr], []),
    startWith([])
  );
  private sortedImages$: Observable<Image[]>;
  private readonly selectedImageSubject = new Subject<Image>();
  private readonly selectedImage$: Observable<Image> = this.selectedImageSubject.asObservable();
  private readonly onDestroySubject = new Subject<true>();
  private readonly onDestroy$: Observable<true> = this.onDestroySubject.asObservable();
  constructor(private httpClient: HttpClient, private matDialog: MatDialog) {
  }
  ngOnInit(): void {
    this.initObservables();
  }
  ngOnDestroy(): void {
    this.onDestroySubject.next(true);
  }
  ngAfterViewInit(): void {
    const goToPreviousPageIfCurrentIsEmpty$ = combineLatest([this.paging$, this.availableImages$]).pipe(
      filter(([paging, availableImages]) => isCurrentPageEmpty(paging, availableImages)),
      filter(([paging, ]) => paging.pageIndex > 0),
      tap(() => {
        this.matPaginator.previousPage();
      }),
      takeUntil(this.onDestroy$)
    );
    goToPreviousPageIfCurrentIsEmpty$.subscribe();
  }
  private initObservables(): void {
    this.initialImages$ = this.fetchImages();
    this.availableImages$ = combineLatest([this.initialImages$, this.deletedImages$, this.filterValue$]).pipe(
      map(([initialImages, deletedImages, filterValue]) =>
        initialImages
          .filter(image => !deletedImages.some(deletedImage => deletedImage.url === image.url))
          .filter(image => image.title.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()))
      )
    );
    this.paging$ = this.pagingSubject.asObservable().pipe(
      startWith({
        pageIndex: 0,
        pageSize: this.resultsPerPage,
      })
    );
    this.sortedImages$ = combineLatest([this.availableImages$, this.selectedSortingOption$]).pipe(
      map(([images, selectedSortingOption]) => sortImages(images, selectedSortingOption))
    );
    this.currentVisibleImages$ = combineLatest([this.sortedImages$, this.paging$]).pipe(
      map(([sortedImages, paging]) =>
        extractPageFromResults(paging.pageIndex, paging.pageSize, sortedImages)
      )
    );
    const openSingleImageViewerInModal$: Observable<any> = this.selectedImage$.pipe(
      withLatestFrom(this.sortedImages$),
      tap(([selectedImage, sortedImages]) => {
        this.matDialog.open<SingleImageViewerComponent, SingleImageViewerData>(
          SingleImageViewerComponent,
          {
            data: {
              images: sortedImages,
              currentImageIndex: sortedImages.findIndex((image: Image) => image.url === selectedImage.url)
            }
          });
      }),
      takeUntil(this.onDestroy$)
    );
    openSingleImageViewerInModal$.subscribe();

  }

  private fetchImages(): Observable<Image[]> {
    if (typeof this.feed === "string") {
      return this.httpClient.get<Image[]>(this.feed);
    } else {
      return of(this.feed);
    }
  }
  public onPageEvent(pageEvent: PageEvent) {
    this.pagingSubject.next(pageEvent);
  }
  public onSortEvent(matOptionSelectionChange: MatOptionSelectionChange) {
    const option = matOptionSelectionChange.source;
    if (option.selected) {
      this.selectedSortingOptionSubject.next(option.value);
    }
  }
  public imageDeleted(image: Image) {
    this.imageDeletedSubject.next(image);
  }
  public imageSelected(image: Image) {
    this.selectedImageSubject.next(image);
  }
}
