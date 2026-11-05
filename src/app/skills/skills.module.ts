import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SkillListComponent } from './skill-list/skill-list.component';

const routes: Routes = [
    { path: '', component: SkillListComponent }
];

@NgModule({
    declarations: [
        SkillListComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class SkillsModule { }
