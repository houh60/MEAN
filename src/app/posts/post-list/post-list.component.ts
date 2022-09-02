import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../post.model';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

    // posts = [
    //     { title: 'First Post', content: 'This is the 1st post\' content.' },
    //     { title: 'Second Post', content: 'This is the 2nd post\' content.' },
    //     { title: 'Third Post', content: 'This is the 3rd post\' content.' },
    // ];
    @Input() posts: Post[] = [];

    constructor() {}

    ngOnInit(): void {
    }


}
