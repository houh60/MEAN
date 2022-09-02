import { Component, OnInit } from '@angular/core';
import { Post } from './posts/post.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    storedPosts: Post[] = [];

    ngOnInit(): void {}

    onPostCreated(post: any) {
        this.storedPosts.push(post);
    }
}
