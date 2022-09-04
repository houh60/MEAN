import { Component, OnInit } from '@angular/core';
import { Post } from './posts/post.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    ngOnInit(): void {}
}
