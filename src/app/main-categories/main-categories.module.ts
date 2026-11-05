import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MainCategoryListComponent } from './main-category-list/main-category-list.component';

const routes: Routes = [
    { path: '', component: MainCategoryListComponent }
];

@NgModule({
    declarations: [MainCategoryListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class MainCategoriesModule { }
