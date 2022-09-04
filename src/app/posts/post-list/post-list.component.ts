import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

    // posts = [
    //     { title: 'First Post', content: 'This is the 1st post\' content.' },
    //     { title: 'Second Post', content: 'This is the 2nd post\' content.' },
    //     { title: 'Third Post', content: 'This is the 3rd post\' content.' },
    // ];
    posts: Post[] = [];
    subscription = new Subscription();
    constructor(
        private postService: PostService
    ) {}

    ngOnInit(): void {
        this.postService.getPosts();
        this.subscription = this.postService.getPostUpdateListener()
            .subscribe({
                next: posts => this.posts = posts,
                error: error => console.log('error: ', error)
            });
    }

    onDelete(postId: string) {
        this.postService.deletePost(postId);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }


}
