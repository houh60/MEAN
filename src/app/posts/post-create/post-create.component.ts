import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

    enteredTitle = '';
    enteredContent = '';
    private mode = 'create';
    private postId: string = '';
    post: Post | undefined;

    constructor(
        private postService: PostService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId') as string;
                this.post = this.postService.getPost(this.postId) as Post;
            } else {
                this.mode = 'create';
                this.postId = 'undefined';
            }
        });
    }

    onAddPost(form: NgForm) {
        if(form.invalid)
            return;
        this.postService.addPost(form.value.title, form.value.content);
        form.resetForm();
    }

}
