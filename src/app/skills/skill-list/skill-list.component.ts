import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-skill-list',
    templateUrl: './skill-list.component.html',
    styleUrls: ['./skill-list.component.css']
})
export class SkillListComponent implements OnInit {
    skills: any[] = [];
    isLoading = false;
    errorMessage = '';

    pagination: any = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    searchQuery: string = '';
    showModal = false;
    isEdit = false;
    isUploading = false;

    currentSkill: any = {
        id: null,
        name: '',
        image: '',
        status: 'active'
    };

    constructor(private core: CoreService) { }

    ngOnInit() {
        this.loadSkills();
    }

    loadSkills(page: number = 1) {
        this.isLoading = true;
        this.errorMessage = '';
        const params: any = { all: true };
        if (this.searchQuery) {
            params.search = this.searchQuery;
        }

        this.core.getData('skills', page, 10, params).subscribe({
            next: (res) => {
                this.skills = res.data || [];
                this.pagination = res.pagination || { total: this.skills.length, page: 1, limit: 10, totalPages: 1 };
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load skills';
            }
        });
    }

    onSearch() {
        this.loadSkills(1);
    }

    onPageChange(page: number) {
        this.loadSkills(page);
    }

    openAddModal() {
        this.isEdit = false;
        this.currentSkill = {
            id: null,
            name: '',
            image: '',
            status: 'active'
        };
        this.showModal = true;
    }

    editSkill(skill: any) {
        this.isEdit = true;
        this.currentSkill = { ...skill };
        this.showModal = true;
    }

    onFileSelected(event: any) {
        const file = event.target.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.core.uploadImage(file).subscribe({
            next: (res: any) => {
                const url = res.url || res.data?.url || (res.filename ? `/uploads/${res.filename}` : '');
                if (url) {
                    this.currentSkill.image = url;
                }
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Image upload failed', err);
                alert('Failed to upload image. Please try again.');
                this.isUploading = false;
            }
        });
    }

    toggleStatus(skill: any) {
        const newStatus = skill.status === 'active' ? 'inactive' : 'active';
        this.core.updateItem('skills', skill.id, { status: newStatus }).subscribe({
            next: () => {
                skill.status = newStatus;
            },
            error: (err) => {
                alert(err.error?.message || 'Failed to update skill status');
            }
        });
    }

    saveSkill() {
        if (!this.currentSkill.name || !this.currentSkill.name.trim()) {
            alert('Skill Name is required');
            return;
        }
        if (!this.currentSkill.image || !this.currentSkill.image.trim()) {
            alert('Skill Image is required');
            return;
        }

        const payload = {
            name: this.currentSkill.name.trim(),
            image: this.currentSkill.image.trim(),
            status: this.currentSkill.status || 'active'
        };

        if (this.isEdit) {
            this.core.updateItem('skills', this.currentSkill.id, payload).subscribe({
                next: () => {
                    this.showModal = false;
                    this.loadSkills(this.pagination.page);
                },
                error: (err) => alert(err.error?.message || 'Failed to update skill')
            });
        } else {
            this.core.addItem('skills', payload).subscribe({
                next: () => {
                    this.showModal = false;
                    this.loadSkills(1);
                },
                error: (err) => alert(err.error?.message || 'Failed to create skill')
            });
        }
    }

    deleteSkill(id: any) {
        if (confirm('Are you sure you want to delete this skill?')) {
            this.core.deleteItem('skills', id).subscribe({
                next: () => this.loadSkills(this.pagination.page),
                error: (err) => alert(err.error?.message || 'Failed to delete skill')
            });
        }
    }

    getImageUrl(path: string): string {
        if (!path) return 'assets/placeholder.png';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
        }
        if (path.startsWith('/uploads') || path.startsWith('uploads')) {
            const base = environment.uploadUrl.replace(/\/uploads$/, '');
            return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return `${environment.uploadUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    }
}
