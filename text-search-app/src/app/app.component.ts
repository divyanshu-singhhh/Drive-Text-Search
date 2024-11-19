import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // <-- Import FormsModule
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatCardModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatTableModule, 
    FormsModule, // <-- Add FormsModule here
    HttpClientModule
  ],
})
export class AppComponent {
  title = 'Search Content Of Your Text Files from Google Drive';
  isLoggedIn = false;
  userName = '';
  message = '';
  query = '';
  results: any[] = [];
  displayedColumns: string[] = ['file_name', 'file_link']; // <-- Define displayedColumns here

  constructor(private http: HttpClient,  private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Check if the user is logged in by calling the /api/user endpoint
    this.http.get('/api/user').subscribe((user: any) => {
      if (user) {
        this.isLoggedIn = true;
        this.userName = user.name;
        this.syncFiles(); 
      }
    });
  }

  loginWithGoogle() {
    // Redirect to Google login via backend API
    window.location.href = '/api/login';
  }

  syncFiles() {
    this.message = 'Your files are being synced...';
    this.http.post('/api/sync', {}).subscribe(() => {
      this.message = '';
      console.log('synced');
      this.showSnackBar('Files synchronized successfully!', 'Close');
    }, (err) => {
      this.message = '';
      this.showSnackBar('Error syncing files. Please refresh the page.', 'Close');
    });
  }

  searchFiles() {
    if (this.query) {
      this.message = 'searching';
      this.http.get(`/api/search?search=${this.query}`).subscribe((res: any) => {
        this.message = '';
        if(!res.length){
          this.showSnackBar('No search result found', 'Close');
        }
        this.results = res;  // Assuming Elasticsearch response format
      }, (err) => {
        this.message = '';
        this.showSnackBar('Error searching files. Please try again later', 'Close');
      });
    }
  }

  logout() {
    this.message = 'logging out';
    this.http.get('/api/login/logout').subscribe({
      next: () => {
        this.message = '';
        this.isLoggedIn = false;
        this.userName = '';
      },
      error: () => {
        this.message = '';
        this.showSnackBar('Failed to logout', 'Close');
      },
    });
  }

  

  showSnackBar = (message: string, action: string): void => {
    console.log('snackbar')
    this.snackBar.open(message, action, {
      duration: 3000, // Snackbar will be visible for 3 seconds
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  };
}
