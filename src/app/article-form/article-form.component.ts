import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsService } from '../services/news/news.service'; 
import { Article } from '../interface/interface.module';   
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { ElectronService } from '../electron.service';  // Importa il servizio ElectronService

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.css']
})
export class ArticleCreateComponent {
  articleForm: FormGroup;
  invalidFields: string[] = [];  // Array per tenere traccia dei campi non validi
  selectedFile: File | null = null;
  isErrorNotified: boolean = false;  // Flag per sapere se l'errore è stato notificato

  constructor(
    private formBuilder: FormBuilder,
    private newsService: NewsService,
    private router: Router,
    private electronService: ElectronService  // Inietta il servizio
  ) {
    this.articleForm = this.formBuilder.group({
      title: ['', Validators.required],
      subtitle: [''],
      abstract: ['', Validators.required],
      category: ['', Validators.required],
      body: ['', Validators.required],
      thumbnail_image: [''],
      thumbnail_media_type: [''],
      image_data: [''],
      image_media_type: ['']
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
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

  onSubmit() {
    this.invalidFields = []; // Resetta l'array dei campi invalidi

    // Verifica la validità del form e aggiungi i campi non validi all'array
    Object.keys(this.articleForm.controls).forEach(field => {
      const control = this.articleForm.get(field);
      if (control && control.invalid) {
        this.invalidFields.push(field);
      }
    });

    if (this.articleForm.invalid) {
      // Mostra una notifica di errore
      this.electronService.sendNotification({
        title: 'ERROR',
        message: 'Error while submitting the form',
      }).then(() => {
        // Quando l'utente clicca sulla notifica, evidenzia i campi invalidi
        this.isErrorNotified = true;
      });
      return;  // Non proseguire con l'invio del form
    }

    const article: Article = this.articleForm.value;

    this.newsService.createArticle(article).subscribe(
      (response: Article) => {
        console.log('Article created:', response);
        this.router.navigate(['/articles']);

        // Invia la notifica quando l'articolo è stato creato
        this.electronService.sendNotification({
          title: 'Article Created',
          message: 'Article Created Successfully',
        });
      },
      (error) => {
        console.error('Error creating article:', error);
      }
    );
  }

  goBack() {
    this.router.navigate(['/articles']);
  }
}