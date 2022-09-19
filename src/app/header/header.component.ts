import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

    private authListenerSubs = new Subscription();
    userIsAuthenticated = false;
    constructor(
        public authSerivce: AuthService
    ) {}

    ngOnInit(): void {
        this.userIsAuthenticated = this.authSerivce.getIsAuth();
        this.authListenerSubs = this.authSerivce.getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
    }

    onLogout() {
        this.authSerivce.logout();
    }

    ngOnDestroy(): void {
        this.authListenerSubs.unsubscribe();
    }
}
