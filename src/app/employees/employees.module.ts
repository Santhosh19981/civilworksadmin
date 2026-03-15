import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

const routes: Routes = [
    { path: '', component: EmployeeListComponent },
    { path: 'add', component: EmployeeFormComponent },
    { path: 'edit/:id', component: EmployeeFormComponent }
];

@NgModule({
    declarations: [
        EmployeeListComponent,
        EmployeeFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class EmployeesModule { }
