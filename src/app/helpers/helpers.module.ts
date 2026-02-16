import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelpersListComponent } from './helpers-list/helpers-list.component';
import { AddHelperComponent } from './add-helper/add-helper.component';
import { EditHelperComponent } from './edit-helper/edit-helper.component';

const routes: Routes = [
    { path: '', component: HelpersListComponent },
    { path: 'add', component: AddHelperComponent },
    { path: 'edit/:id', component: EditHelperComponent }
];

@NgModule({
    declarations: [
        HelpersListComponent,
        AddHelperComponent,
        EditHelperComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ]
})
export class HelpersModule { }
