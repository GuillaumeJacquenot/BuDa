import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TreeTableModule, SharedModule } from 'primeng/primeng';

import { AppComponent } from './app.component';
import { ProjectPageComponent } from './project-page/project-page.component';
import { RequirementsComponent } from './requirements/requirements.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { ModelComponent } from './model/model.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { HttpClientModule } from '@angular/common/http';

import { NeoConnectService } from '../services/neo-connect.service';
import { NotificationsService } from '../services/notifications.service';
import { AuthGuardService } from '../services/auth-guard.service';
import { ExternalMessagesService } from '../services/external-messages.service';
import { RabbitMqReceiverService } from '../services/rabbit-mq-receiver.service';

import { BlocksComponent } from './blocks/blocks.component';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { MenuComponent } from './menu/menu.component';
import { MenuParentComponent } from './menu-parent/menu-parent.component';
import { ReversePipe } from './reverse.pipe';
import { SpinnerComponent } from './spinner/spinner.component';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CompareComponentComponent } from './compare-component/compare-component.component';
import { BlockModalComponent } from './block-modal/block-modal.component';
import { StateModalComponent } from './state-modal/state-modal.component';
import { ComplianceComponent } from './compliance/compliance.component';

const appRoutes: Routes = [
  {
    path: 'projects',
    redirectTo: ''
  },
  {
    path: '',
    canActivate: [AuthGuardService],
    component: ProjectListComponent
  },
  {
    path: 'users',
    canActivate: [AuthGuardService],
    component: UsersComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
     path: 'proj/:id',
     canActivate: [AuthGuardService],
     component: ProjectPageComponent
  },
  {
    path: 'proj/:id/requirements',
    canActivate: [AuthGuardService],
    component: RequirementsComponent
  },
  {
    path: 'proj/:id/scenarios',
    canActivate: [AuthGuardService],
    component: ScenariosComponent
  },
  {
    path: 'proj/:id/blocks',
    canActivate: [AuthGuardService],
    component: BlocksComponent
  },
  {
    path: 'proj/:id/compliance',
    canActivate: [AuthGuardService],
    component: ComplianceComponent
  },
  {
    path: 'proj/:id/model/:blockName',
    canActivate: [AuthGuardService],
    component: ModelComponent
  },
  {
    path: '**',
    canActivate: [AuthGuardService],
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    AppComponent,
    ProjectPageComponent,
    RequirementsComponent,
    ScenariosComponent,
    ModelComponent,
    ProjectListComponent,
    BlocksComponent,
    InfoModalComponent,
    AlertModalComponent,
    CreateModalComponent,
    EditModalComponent,
    MenuComponent,
    MenuParentComponent,
    ReversePipe,
    SpinnerComponent,
    UsersComponent,
    LoginComponent,
    CreateUserComponent,
    CompareComponentComponent,
    BlockModalComponent,
    StateModalComponent,
    ComplianceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    TreeTableModule,
    SharedModule
  ],
  providers: [
    NeoConnectService,
    NotificationsService,
    AuthGuardService,
    ExternalMessagesService,
    RabbitMqReceiverService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
