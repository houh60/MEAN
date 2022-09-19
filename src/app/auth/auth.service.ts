import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

@Injectable({ providedIn: 'root' })
export class AuthService {

    signUpUrl = 'http://localhost:3000/api/users/signup';
    loginUrl = 'http://localhost:3000/api/users/login';
    private token: string = '';
    private authStatusListener = new Subject<boolean>();
    isAuthenticated = false;
    private tokenTimer: any;

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

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post(this.signUpUrl, authData).subscribe(response => {
            console.log('response: ', response);
            this.router.navigate(['/']);
        });
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post<{ token: string, expiresIn: number }>(this.loginUrl, authData).subscribe(response => {
            this.token = response.token;
            if(response.token) {
                const expiresInDuration = response.expiresIn;
                console.log('expiresInDuration: ', expiresInDuration);
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.authStatusListener.next(true);
                const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
                this.saveAuthData(this.token, expirationDate);
                this.router.navigate(['/']);
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
        this.router.navigate(['/']);
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('experation', expirationDate.toISOString());
    }

    private clearAuthData() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('experation');
    }

    private getAuthData() {
        const token = sessionStorage.getItem('token');
        const expirationDate = sessionStorage.getItem('experation');
        if(!(token && expirationDate)) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate)
        };
    }
}
