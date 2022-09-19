import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {

    signUpUrl = environment.apiUrl + 'users/signup';
    loginUrl = environment.apiUrl + 'users/login';
    private token: string = '';
    private authStatusListener = new Subject<boolean>();
    isAuthenticated = false;
    private tokenTimer: any;
    private userId = '';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post(this.signUpUrl, authData).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: () => {
                this.authStatusListener.next(false);
            }
        });
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post<{ token: string, expiresIn: number, userId: string }>(this.loginUrl, authData).subscribe({
            next: response => {
                this.token = response.token;
                if(response.token) {
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    this.authStatusListener.next(true);
                    const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
                    this.saveAuthData(this.token, expirationDate, this.userId);
                    this.router.navigate(['/']);
                }
            },
            error: () => {
                this.authStatusListener.next(false);
            }
        });
    }

    autoAuthUser() {
        const authInfo = this.getAuthData();
        const now = new Date();
        const expiresIn = (authInfo?.expirationDate as Date)?.getTime() - now.getTime();
        if(expiresIn > 0) {
            this.token = authInfo?.token as string;
            this.isAuthenticated = true;
            this.userId = authInfo?.userId as string;
            this.authStatusListener.next(true);
            this.setAuthTimer(expiresIn / 1000);
        }
    }

    logout() {
        this.token = '';
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = '';
        this.router.navigate(['/']);
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('experation', expirationDate.toISOString());
    }

    private clearAuthData() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('experation');
        sessionStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = sessionStorage.getItem('token');
        const expirationDate = sessionStorage.getItem('experation');
        const userId = sessionStorage.getItem('userId');
        if(!(token && expirationDate)) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        };
    }
}
