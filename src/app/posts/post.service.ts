import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { map, Subject } from "rxjs";
import { Post } from "./post.model";

@Injectable({ providedIn: 'root' })
export class PostService {
    private posts: Post[] = [];
    private postAdded = new Subject<{ posts: Post[], postCount: number }>();
    url = 'http://localhost:3000/api/posts/';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{ message: string, posts: any, maxPosts: number }>(this.url + queryParams)
            .pipe(map(postData => {
                return {
                    posts: postData.posts.map((post: any) => {
                        return {
                            title: post.title,
                            content: post.content,
                            id: post._id,
                            imagePath: post.imagePath
                        };
                    }),
                    maxPosts: postData.maxPosts
                };
            }))
            .subscribe(transformedPostData => {
                this.posts = transformedPostData.posts;
                this.postAdded.next({
                    posts: [...this.posts],
                    postCount: transformedPostData.maxPosts
                });
            });
    }

    getPostUpdateListener() {
        return this.postAdded.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(this.url + id);
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.http.post<{ message: string, post: Post }>(this.url, postData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData;
        if(typeof (image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image
            }
        }
        const headers = this.setHeaders(id);
        this.http.put(this.url + id, postData, { headers }).subscribe(() => {
            this.router.navigate(['/']);
        });
    }

    deletePost(postId: string) {
        const headers = this.setHeaders(postId);
        return this.http.delete(this.url + postId, { headers });
    }

    setHeaders(id: string) {
        let postToDelete = this.posts.find(post => post.id == id);
        let path;
        if(postToDelete) {
            path = postToDelete.imagePath;
            let start = path.indexOf('images');
            path = 'backend/' + path.substring(start);
        }
        return new HttpHeaders().set('path', path as string);
    }
}
