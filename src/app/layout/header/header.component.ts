import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(public auth: AuthService) {}

    get currentUser() {
        return this.auth.currentUserValue;
    }

    get userAvatar() {
        const user = this.currentUser;
        if (!user || (!user.image && !user.name)) return 'AD';
        
        if (user.image) {
            if (user.image.startsWith('http') || user.image.startsWith('data:image')) {
                return user.image;
            }
            return `${environment.uploadUrl}/${user.image}`;
        }

        // Initials fallback
        return user.name.substring(0, 2).toUpperCase();
    }
}
