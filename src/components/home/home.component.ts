
import { Component, ChangeDetectionStrategy, inject, output, signal, OnDestroy, afterNextRender, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { SettingsService } from '../../services/settings.service';
import { ViolationsService } from '../../services/violations.service';
import { ToolService } from '../../services/tool.service';
import { ToolStateService } from '../../services/tool-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  private contentService = inject(ContentService);
  settingsService = inject(SettingsService);
  private violationsService = inject(ViolationsService);
  private toolService = inject(ToolService);
  private toolStateService = inject(ToolStateService);
  
  login = output<void>();
  navigate = output<string>();
  
  private animationIntervals: any[] = [];
  
  // Typewriter effect state
  typewriterText = signal('');
  private fullText = 'منصة ذكاء اصطناعي متطورة صُممت لتمكين الصحفيين والمحللين والكتاب اليمنيين. من التحقق من الاخبار الزائفة و بناء تحقيقات ومقالات، وتحليل البيانات الجيوسياسية المعقدة بمحرك يفهم اللهجات ومصمم لخصوصية السياق اليمني.';
  showButtons = signal(false);

  // --- Data Signals from Services ---
  stats = this.contentService.stats;
  team = this.contentService.team;
  partners = this.contentService.partners;
  news = this.contentService.news;

  // Violations Data for Charts
  violationsByGovernorate = this.violationsService.statsByGovernorate;
  totalViolations = this.violationsService.totalViolations;

  perpetratorChartData = computed(() => {
    const data = this.violationsService.statsByPerpetrator();
    const total = this.totalViolations();
    if (total === 0) return [];

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return data.map(item => {
      const percentage = (item.count / total) * 100;
      // Start from top (-90deg)
      const rotation = -90 + (cumulativePercentage / 100) * 360;
      
      const segmentData = {
        ...item,
        percentage: percentage.toFixed(1),
        strokeDasharray: `${circumference}`,
        strokeDashoffset: circumference - (percentage / 100) * circumference,
        rotation,
      };
      cumulativePercentage += percentage;
      return segmentData;
    });
  });


  constructor() {
    afterNextRender(() => {
      this.animateStats();
      this.startTypewriter();
    });
  }

  ngOnDestroy() {
    this.animationIntervals.forEach(clearInterval);
  }

  private startTypewriter() {
    let i = 0;
    const speed = 30; 
    const interval = setInterval(() => {
      if (i < this.fullText.length) {
        this.typewriterText.update(t => t + this.fullText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        this.showButtons.set(true);
      }
    }, speed);
    this.animationIntervals.push(interval);
  }

  private animateStats() {
    // Re-initialize displayValue to 0 for animation on component load
    this.stats.update(stats => stats.map(s => ({...s, displayValue: 0})));

    this.stats().forEach((stat, index) => {
      const duration = 1500; // ms
      const stepTime = 20; // ms
      const totalSteps = duration / stepTime;
      const increment = stat.value / totalSteps;

      const interval = setInterval(() => {
        this.stats.update(currentStats => {
          const newStats = [...currentStats];
          const currentStat = newStats.find(s => s.label === stat.label); // find by unique property
          if(currentStat) {
            if (currentStat.displayValue < currentStat.value) {
              currentStat.displayValue = Math.min(currentStat.value, currentStat.displayValue + increment);
            } else {
              currentStat.displayValue = currentStat.value; // Ensure it ends on the exact value
              clearInterval(interval);
            }
          }
          return newStats;
        });
      }, stepTime);
      this.animationIntervals.push(interval);
    });
  }

  onNavigate(page: string) {
    if (page.startsWith('#')) {
      document.querySelector(page)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.navigate.emit(page);
    }
  }

  openAiChat() {
     // Check if user is logged in first in a real app, or open free trial
     this.navigate.emit('ai-core');
  }
}
