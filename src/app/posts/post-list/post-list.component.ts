import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

    posts: Post[] = [];
    subscription = new Subscription();
    isLoading = false;
    totalPosts = 0;
    postPerPage = 2;
    currentPage = 1;
    pageSizeOptions = [2, 5, 10];
    private authListenerSubs = new Subscription();
    userIsAuthenticated = false;

    constructor(
        private postService: PostService,
        private authSerivce: AuthService
    ) {}

    ngOnInit(): void {
        this.postService.getPosts(this.postPerPage, 1);
        this.isLoading = true;
        this.subscription = this.postService.getPostUpdateListener()
            .subscribe({
                next: postData => {
                    this.posts = postData.posts;
                    this.totalPosts = postData.postCount;
                    this.isLoading = false;
                },
                error: error => console.log('error: ', error)
            });
        this.userIsAuthenticated = this.authSerivce.getIsAuth();
        this.authListenerSubs = this.authSerivce.getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
    }

    onDelete(postId: string) {
        this.isLoading = true;
        this.postService.deletePost(postId).subscribe(() => {
            this.postService.getPosts(this.postPerPage, this.currentPage);
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.authListenerSubs.unsubscribe();
    }

    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postPerPage = pageData.pageSize;
        this.postService.getPosts(this.postPerPage, this.currentPage);
    }
}
