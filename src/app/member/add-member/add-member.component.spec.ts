import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';
import {ApiService, ProjectService} from '../../core/services';
import {SharedModule} from '../../shared/shared.module';
import {fakeMember} from '../../testing/fake-data/member.fake';
import {asyncData} from '../../testing/services/api-mock.service';
import {MatDialogRefMock} from '../../testing/services/mat-dialog-ref-mock';
import {ProjectMockService} from '../../testing/services/project-mock.service';
import {AddMemberComponent} from './add-member.component';

const modules: any[] = [
  BrowserModule,
  BrowserAnimationsModule,
  SlimLoadingBarModule.forRoot(),
  SharedModule,
];

describe('AddProjectComponent', () => {
  let fixture: ComponentFixture<AddMemberComponent>;
  let component: AddMemberComponent;

  beforeEach(async(() => {
    const apiMock = jasmine.createSpyObj('ApiService', ['createMember']);
    apiMock.createMember.and.returnValue(asyncData(fakeMember()));

    TestBed
        .configureTestingModule({
          imports: [
            ...modules,
          ],
          declarations: [
            AddMemberComponent,
          ],
          providers: [
            {provide: MatDialogRef, useClass: MatDialogRefMock},
            {provide: ApiService, useValue: apiMock},
            {provide: ProjectService, useClass: ProjectMockService},
          ],
        })
        .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddMemberComponent);
    component = fixture.componentInstance;
  }));

  it('should create the add member component', async(() => {
       expect(component).toBeTruthy();
     }));
});