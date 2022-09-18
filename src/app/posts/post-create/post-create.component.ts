import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

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
    isLoading = false;
    form: FormGroup = new FormGroup({});
    imagePreview = '';

    constructor(
        private postService: PostService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.form = new FormGroup({
            title: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            image: new FormControl(null, Validators.required, mimeType)
        });
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId') as string;
                this.isLoading = true;
                this.postService.getPost(this.postId).subscribe(postData => {
                    this.post = {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath
                    };
                    this.isLoading = false;
                    this.form.setValue({
                        title: this.post.title,
                        content: this.post.content,
                        image: this.post.imagePath
                    });
                });
            } else {
                this.mode = 'create';
                this.postId = 'undefined';
            }
        });
    }

    onSavePost() {
        if(this.form.invalid)
            return;

        this.isLoading = true;
        if(this.mode === 'create') {
            this.postService.addPost(
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        } else {
            this.postService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        }
        this.form.reset();
    }

    onImagePicked(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if(files) {
            const file = files[0];
            this.form.patchValue({ image: file });
            this.form.get('image')?.updateValueAndValidity();
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
}
