// ...existing code...
import { Component, OnInit, DoCheck, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, CommonModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, DoCheck {
  showLangMenu = false;
  isLoggedIn = signal(false);
  user = signal<any>(null);

  languages = [
    { code: 'en', label: 'EN' },
    { code: 'ka', label: 'KA' },
    { code: 'ru', label: 'RU' },
  ];
  currentLang = 'ka';

  constructor(private translate: TranslateService) {
    // Set default language and use it immediately
    this.translate.setDefaultLang('ka');
    this.translate.use('ka');
    this.currentLang = 'ka';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    // currentLang will update via onLangChange
  }

  ngOnInit() {
    this.checkLoginStatus();
    // Listen for storage changes (when logged in from another tab)
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });
  }

  ngDoCheck() {
    // Check login status on every change detection cycle
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');

    if (this.isLoggedIn() !== loggedIn) {
      this.isLoggedIn.set(loggedIn);
      this.user.set(userData ? JSON.parse(userData) : null);
    }
  }

  private checkLoginStatus() {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');
    this.isLoggedIn.set(loggedIn);
    this.user.set(userData ? JSON.parse(userData) : null);
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false);
    this.user.set(null);
  }
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
