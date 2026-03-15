import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListComponent } from './category-list/category-list.component';
import { SubcategoryListComponent } from './subcategory-list/subcategory-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
    { path: '', component: CategoryListComponent },
    { path: 'subcategories', component: SubcategoryListComponent }
];

@NgModule({
    declarations: [CategoryListComponent, SubcategoryListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class CategoriesModule { }
