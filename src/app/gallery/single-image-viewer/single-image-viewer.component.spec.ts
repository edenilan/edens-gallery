import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleImageViewerComponent } from './single-image-viewer.component';

describe('SingleImageViewerComponent', () => {
  let component: SingleImageViewerComponent;
  let fixture: ComponentFixture<SingleImageViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleImageViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
