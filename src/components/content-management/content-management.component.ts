import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService, TeamMember, Project, NewsArticle, AboutContent } from '../../services/content.service';

type AdminTab = 'about' | 'team' | 'projects' | 'news';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentManagementComponent {
  private contentService = inject(ContentService);
  
  activeTab = signal<AdminTab>('about');
  
  // Local editable signals, initialized from the service to prevent direct mutation
  editableAbout = signal<AboutContent>(JSON.parse(JSON.stringify(this.contentService.aboutContent())));
  editableTeam = signal<TeamMember[]>(JSON.parse(JSON.stringify(this.contentService.team())));
  editableAdvisors = signal<TeamMember[]>(JSON.parse(JSON.stringify(this.contentService.advisors())));
  editableProjects = signal<Project[]>(JSON.parse(JSON.stringify(this.contentService.projects())));
  editableNews = signal<NewsArticle[]>(JSON.parse(JSON.stringify(this.contentService.news())));

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  // --- Save Methods ---
  saveAbout() {
    this.contentService.saveAboutContent(this.editableAbout());
    alert('تم حفظ محتوى "من نحن" بنجاح.');
  }
  
  saveTeam() {
    this.contentService.saveTeam(this.editableTeam());
    this.contentService.saveAdvisors(this.editableAdvisors());
    alert('تم حفظ بيانات الفريق والهيئة الاستشارية.');
  }

  saveProjects() {
    this.contentService.saveProjects(this.editableProjects());
    alert('تم حفظ المشاريع.');
  }

  saveNews() {
    this.contentService.saveNews(this.editableNews());
    alert('تم حفظ الأخبار والتقارير.');
  }

  // --- Team Management ---
  addTeamMember() {
    this.editableTeam.update(team => [...team, { id: Date.now(), name: 'عضو جديد', title: 'منصب', imageUrl: 'https://picsum.photos/seed/'+Date.now()+'/200' }]);
  }
  removeTeamMember(id: number) {
    this.editableTeam.update(team => team.filter(m => m.id !== id));
  }
  addAdvisor() {
    this.editableAdvisors.update(adv => [...adv, { id: Date.now(), name: 'مستشار جديد', title: 'عضو هيئة استشارية', imageUrl: 'https://picsum.photos/seed/'+Date.now()+'/200' }]);
  }
  removeAdvisor(id: number) {
    this.editableAdvisors.update(adv => adv.filter(m => m.id !== id));
  }
  
  // --- Project Management ---
  addProject() {
     this.editableProjects.update(proj => [...proj, { id: Date.now(), title: 'مشروع جديد', description: 'وصف المشروع', imageUrl: 'https://picsum.photos/seed/'+Date.now()+'/400/300' }]);
  }
  removeProject(id: number) {
     this.editableProjects.update(proj => proj.filter(p => p.id !== id));
  }

  // --- News Management ---
  addNews() {
    this.editableNews.update(news => [...news, { id: Date.now(), title: 'خبر جديد', category: 'خبر', summary: 'ملخص قصير للخبر...', date: new Date().toISOString().split('T')[0], imageUrl: 'https://picsum.photos/seed/'+Date.now()+'/400/300' }]);
  }
  removeNews(id: number) {
     this.editableNews.update(news => news.filter(n => n.id !== id));
  }

}
