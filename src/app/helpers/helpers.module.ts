import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelpersListComponent } from './helpers-list/helpers-list.component';
import { HelperMembersListComponent } from './helper-members-list/helper-members-list.component';
import { AddHelperComponent } from './add-helper/add-helper.component';
import { EditHelperComponent } from './edit-helper/edit-helper.component';
import { AddMemberComponent } from './helper-member-form/add-member.component';
import { EditMemberComponent } from './helper-member-form/edit-member.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
    { path: 'services', component: HelpersListComponent },
    { path: 'workers', component: HelperMembersListComponent },
    { path: 'services/add', component: AddHelperComponent },
    { path: 'services/edit/:id', component: EditHelperComponent },
    { path: 'workers/add-member', component: AddMemberComponent },
    { path: 'workers/edit-member/:id', component: EditMemberComponent },
    { path: '', redirectTo: 'services', pathMatch: 'full' }
];

@NgModule({
    declarations: [
        HelpersListComponent,
        HelperMembersListComponent,
        AddHelperComponent,
        EditHelperComponent,
        AddMemberComponent,
        EditMemberComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class HelpersModule { }
