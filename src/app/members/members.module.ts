import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HelperMemberListComponent } from './helper-member-list/helper-member-list.component';
import { HelperMemberFormComponent } from './helper-member-form/helper-member-form.component';

const routes: Routes = [
    { path: '', component: HelperMemberListComponent },
    { path: 'add', component: HelperMemberFormComponent },
    { path: 'edit/:id', component: HelperMemberFormComponent }
];

@NgModule({
    declarations: [
        HelperMemberListComponent,
        HelperMemberFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class MembersModule { }
