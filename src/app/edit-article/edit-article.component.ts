import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Article } from '../interface/interface.module';  
import { NewsService } from '../services/news/news.service';
import { ActivatedRoute } from '@angular/router';
import { Location, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ElectronService } from '../electron.service';  // Importa il servizio ElectronService

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css']
})
export class EditArticleComponent implements OnInit {
  articleForm: FormGroup;
  article: Article | undefined;
  invalidFields: string[] = [];
  isErrorNotified: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private articleService: NewsService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private electronService: ElectronService
    
    
  ) {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      abstract: ['', Validators.required],
      body: ['', Validators.required],
      category: ['', Validators.required],
      thumbnail_image: [''], 
      thumbnail_media_type: [''], 
      image_data: [''],  
      image_media_type: ['']  
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.articleService.getArticleById(id).subscribe((article) => {
      this.article = article;
      this.articleForm.patchValue(article);
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result.split(',')[1];
        this.articleForm.patchValue({
          thumbnail_image: base64String,
          thumbnail_media_type: file.type,
          image_data: base64String,
          image_media_type: file.type
        });
      };
      reader.readAsDataURL(file); 
    }
  }

  onSubmit(): void {
    this.invalidFields = []; // Resetta l'array dei campi invalidi

    // Verifica la validità del form e aggiungi i campi non validi all'array
    Object.keys(this.articleForm.controls).forEach(field => {
      const control = this.articleForm.get(field);
      if (control && control.invalid) {
        this.invalidFields.push(field);
      }
    });
    if (this.articleForm.invalid && this.article) {
      this.electronService.sendNotification({
        title: 'ERROR',
        message: 'Error while submitting the form',
      }).then(() => {
        // Quando l'utente clicca sulla notifica, evidenzia i campi invalidi
        this.isErrorNotified = true;
      });
      return;  // Non proseguire con l'invio del form
      
    }else{
      const updatedArticle = {
        ...this.article,
        ...this.articleForm.value
      };
      this.articleService.updateArticle(updatedArticle).subscribe(() => {
        console.log('Article updated successfully');
        this.electronService.sendNotification({
          title: 'Article Edited',
          message: 'Article Edited Successfully',
        });
        this.goBack();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);  // Naviga verso la rotta '/main'
  }
}