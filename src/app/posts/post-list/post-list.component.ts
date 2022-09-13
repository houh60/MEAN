import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
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
    totalPosts = 10;
    postPerPage = 2;
    currentPage = 1;
    pageSizeOptions = [2, 5, 10];

    constructor(
        private postService: PostService
    ) {}

    ngOnInit(): void {
        this.postService.getPosts(this.postPerPage, 1);
        this.isLoading = true;
        this.subscription = this.postService.getPostUpdateListener()
            .subscribe({
                next: posts => {
                    this.posts = posts;
                    this.isLoading = false;
                },
                error: error => console.log('error: ', error)
            });
    }

    onDelete(postId: string) {
        this.postService.deletePost(postId);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postPerPage = pageData.pageSize;
        this.postService.getPosts(this.postPerPage, this.currentPage);
    }
}
