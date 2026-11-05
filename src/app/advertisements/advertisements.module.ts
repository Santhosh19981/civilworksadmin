import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdvertisementListComponent } from './advertisement-list/advertisement-list.component';

const routes: Routes = [
    { path: '', component: AdvertisementListComponent }
];

@NgModule({
    declarations: [AdvertisementListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class AdvertisementsModule { }
