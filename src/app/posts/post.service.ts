import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { map, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({ providedIn: 'root' })
export class PostService {
    private posts: Post[] = [];
    private postAdded = new Subject<Post[]>();
    url = 'http://localhost:3000/api/posts/';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    getPosts() {
        this.http.get<{ message: string, posts: any }>(this.url)
            .pipe(map(postData => {
                return postData.posts.map((post: any) => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    };
                });
            }))
            .subscribe(transformedPosts => {
                this.posts = transformedPosts;
                this.postAdded.next([...this.posts]);
            });
    }

    getPostUpdateListener() {
        return this.postAdded.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{ _id: string, title: string, content: string }>(this.url + id);
    }

    addPost(title: string, content: string) {
        const post: Post = { id: 'undefined', title: title, content: content };
        this.http.post<{ message: string, postId: string }>(this.url, post)
            .subscribe(responseData => {
                post.id = responseData.postId;
                this.posts.push(post);
                this.postAdded.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string) {
        const post: Post = { id: id, title: title, content: content };
        this.http.put(this.url + id, post).subscribe(response => {
            const updatedPosts = [...this.posts];
            const oldPostIndex = updatedPosts.findIndex(p => p.id == post.id);
            updatedPosts[oldPostIndex] = post;
            this.posts = updatedPosts;
            this.postAdded.next([...this.posts]);
            this.router.navigate(['/']);
        });
    }

    deletePost(postId: string) {
        this.http.delete(this.url + postId).subscribe(() => {
            console.log('Deleted');
            const updatedPosts = this.posts.filter(post => post.id !== postId);
            this.posts = updatedPosts;
            this.postAdded.next([...this.posts]);
        });
    }
}
