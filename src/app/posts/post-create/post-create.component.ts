import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId') as string;
                console.log('this.postId: ', this.postId);
                this.postService.getPost(this.postId).subscribe(postData => {
                    this.post = { id: postData._id, title: postData.title, content: postData.content };
                });
            } else {
                this.mode = 'create';
                this.postId = 'undefined';
            }
        });
    }

    onAddPost(form: NgForm) {
        if(form.invalid)
            return;
        if(this.mode === 'create') {
            this.postService.addPost(form.value.title, form.value.content);
        } else {
            this.postService.updatePost(this.postId, form.value.title, form.value.content);
        }
        form.resetForm();
        this.router.navigate(['/list']);
    }

}
