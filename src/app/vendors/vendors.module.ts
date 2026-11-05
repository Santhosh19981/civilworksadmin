import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';

const routes: Routes = [
    { path: '', component: VendorListComponent },
    { path: 'add', component: VendorFormComponent },
    { path: 'edit/:id', component: VendorFormComponent }
];

@NgModule({
    declarations: [VendorListComponent, VendorFormComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class VendorsModule { }

