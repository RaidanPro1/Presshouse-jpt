import { Injectable, signal, effect } from '@angular/core';

// --- Shared Interfaces for Content ---

export interface Stat {
  value: number;
  label: string;
  displayValue: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  isSpecial?: boolean;
}

export interface NewsArticle {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  date: string;
  summary: string;
}

export interface Partner {
  name: string;
  logoUrl: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string;
  imageUrl: string;
}

export interface AboutContent {
  introduction: string;
  vision: string;
  mission: string;
  objectives: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  // --- State Signals for all Public Content ---
  stats = signal<Stat[]>([]);
  projects = signal<Project[]>([]);
  team = signal<TeamMember[]>([]);
  advisors = signal<TeamMember[]>([]);
  partners = signal<Partner[]>([]);
  news = signal<NewsArticle[]>([]);
  aboutContent = signal<AboutContent>({ introduction: '', vision: '', mission: '', objectives: [] });

  constructor() {
    this.loadContent();

    // Effect to persist changes to localStorage, simulating a backend.
    effect(() => {
      localStorage.setItem('app-content-stats', JSON.stringify(this.stats()));
      localStorage.setItem('app-content-projects', JSON.stringify(this.projects()));
      localStorage.setItem('app-content-team', JSON.stringify(this.team()));
      localStorage.setItem('app-content-advisors', JSON.stringify(this.advisors()));
      localStorage.setItem('app-content-partners', JSON.stringify(this.partners()));
      localStorage.setItem('app-content-news', JSON.stringify(this.news()));
      localStorage.setItem('app-content-about', JSON.stringify(this.aboutContent()));
    });
  }

  private loadContent() {
    const load = <T>(key: string, defaultValue: T): T => {
      const saved = localStorage.getItem(key);
      try {
        return saved ? JSON.parse(saved) : defaultValue;
      } catch (e) {
        console.error(`Failed to load ${key} from localStorage`, e);
        return defaultValue;
      }
    };

    this.stats.set(load('app-content-stats', this.getDefaultStats()));
    this.projects.set(load('app-content-projects', this.getDefaultProjects()));
    this.team.set(load('app-content-team', this.getDefaultTeam()));
    this.advisors.set(load('app-content-advisors', this.getDefaultAdvisors()));
    this.partners.set(load('app-content-partners', this.getDefaultPartners()));
    this.news.set(load('app-content-news', this.getDefaultNews()));
    this.aboutContent.set(load('app-content-about', this.getDefaultAbout()));
  }

  // --- Public Methods for Admin Panel to Update Content ---
  saveAboutContent(content: AboutContent) { this.aboutContent.set(content); }
  saveTeam(members: TeamMember[]) { this.team.set(members); }
  saveAdvisors(members: TeamMember[]) { this.advisors.set(members); }
  saveProjects(projects: Project[]) { this.projects.set(projects); }
  saveNews(articles: NewsArticle[]) { this.news.set(articles); }
  savePartners(partners: Partner[]) { this.partners.set(partners); }
  saveStats(stats: Stat[]) { this.stats.set(stats); }


  // --- Default Data Initialization ---
  private getDefaultStats(): Stat[] {
    return [
      { value: 45, label: 'مشروعاً منفذاً', displayValue: 0 },
      { value: 1204, label: 'انتهاكاً موثقاً', displayValue: 0 },
      { value: 850, label: 'صحفياً مستفيداً', displayValue: 0 },
      { value: 65, label: 'شريكاً محلياً ودولياً', displayValue: 0 },
    ];
  }

  private getDefaultProjects(): Project[] {
    return [
      {
        id: 1,
        title: 'منصة YemenJPT',
        description: 'بيئة عمل رقمية سيادية ومؤمنة، مصممة خصيصاً لتمكين الصحافة الاستقصائية في اليمن. أدوات للتقصي، التحقق، والتحليل في مكان واحد. مشروع بشراكة استراتيجية مع RaidanPro.',
        imageUrl: 'assets/images/projects/yemenjpt.jpg',
        isSpecial: true,
      },
      { id: 2, title: 'مشروع احياء القيم الصحفية', description: 'يهدف المشروع إلى إحياء القيم المهنية للصحافة من خلال إحياء ذكرى أعلام الصحافة في اليمن والاحتفاء بالقيم التي يمثلونها.', imageUrl: 'https://picsum.photos/seed/project1/400/300' },
      { id: 3, title: 'مشروع قوة الذكاء الاصطناعي بمسؤولية', description: 'جلسات تدريبية وجاهية ورقمية حول استخدام أدوات الذكاء الاصطناعي في العمل الصحفي بمسؤولية وأخلاقية.', imageUrl: 'https://picsum.photos/seed/project2/400/300' },
      { id: 4, title: 'مشروع الصحافة مفتوحة المصدر', description: 'تعزيز قدرات الصحفيين في تحقيقات المصادر المفتوحة (OSINT) واستخدام الأدوات الرقمية في الصحافة.', imageUrl: 'https://picsum.photos/seed/project3/400/300' },
    ];
  }

  private getDefaultTeam(): TeamMember[] {
    return [
      { id: 1, name: 'محمد الحريبي', title: 'رئيس المؤسسة', imageUrl: 'assets/team/mohammed-alharibi.jpg' },
      { id: 2, name: 'مازن فارس', title: 'المدير التنفيذي', imageUrl: 'assets/team/mazen-fares.jpg' },
      { id: 3, name: 'الفتح العيسائي', title: 'مدير البرامج', imageUrl: 'assets/team/alfateh-alissai.jpg' },
      { id: 4, name: 'مكين العوجري', title: 'مدير وحدة المالية', imageUrl: 'assets/team/makeen-alawjari.jpg' },
      { id: 5, name: 'أحمد منعم', title: 'إدارة الإعلام', imageUrl: 'assets/team/ahmed-monem.jpg' },
    ];
  }
  
  private getDefaultAdvisors(): TeamMember[] {
      return [
        { id: 101, name: 'أ. زكريا الكمالي', title: 'عضو الهيئة الاستشارية', imageUrl: 'assets/advisors/zakaria-alkamali.jpg' },
        { id: 102, name: 'د. منصور القدسي', title: 'عضو الهيئة الاستشارية', imageUrl: 'assets/advisors/mansour-alqudsi.jpg' },
        { id: 103, name: 'أ. وداد البدوي', title: 'عضو الهيئة الاستشارية', imageUrl: 'assets/advisors/wedad-albadawi.jpg' },
      ];
  }

  private getDefaultPartners(): Partner[] {
    return [
      { name: 'YoopYupFact', logoUrl: 'assets/logos/partners/yoopyupfact.png' },
      { name: 'Qarar Foundation', logoUrl: 'assets/logos/partners/qarar.png' },
      { name: 'Arnyada Foundation', logoUrl: 'assets/logos/partners/arnyada.png' },
      { name: 'Wahaj Youth Bloc', logoUrl: 'assets/logos/partners/wahaj.png' },
      { name: 'Alef Center', logoUrl: 'assets/logos/partners/alef.png' },
      { name: 'RaidanPro', logoUrl: 'assets/logos/partners/raidanpro.png' },
    ];
  }

  private getDefaultNews(): NewsArticle[] {
    return [
      { id: 1, title: 'بيت الصحافة يختتم دورة تدريبية حول الأمان الرقمي للصحفيين', category: 'تدريب', imageUrl: 'assets/images/news/training.jpg', date: '25 يوليو 2024', summary: 'شارك في الدورة 20 صحفياً وصحفية من مختلف المحافظات اليمنية لتعزيز مهاراتهم في حماية أنفسهم رقمياً.' },
      { id: 2, title: 'بيان إدانة لاستهداف طاقم إعلامي في محافظة مأرب', category: 'بيان', imageUrl: 'assets/images/news/violation.jpg', date: '22 يوليو 2024', summary: 'أدان بيت الصحافة بشدة استهداف طاقم إعلامي في محافظة مأرب، مما أسفر عن إصابة مصور صحفي.' },
      { id: 3, title: 'تقرير: تأثير انقطاع الإنترنت على قطاع التعليم في اليمن', category: 'تقرير', imageUrl: 'assets/images/news/education.jpg', date: '20 يوليو 2024', summary: 'تقرير يسلط الضوء على التحديات التي يواجهها الطلاب والمعلمون بسبب ضعف البنية التحتية للاتصالات.' },
    ];
  }

  private getDefaultAbout(): AboutContent {
    return {
      introduction: "في ظل الوضع القائم في اليمن والحرب المستمرة، عاشت الصحافة تأثيرات كل هذه الظروف، وانتكست كثيرًا بسببها. ورغم أن صحافة اليمن تمتلك الصوت والقدرة إلا أنها لا تملك الآلية لتوظيف ذلك في صالح استحقاقاتها. من هنا تأسس بيت الصحافة ليرتقي بالصحافة ويعيدها إلى مكانتها الحقيقية كعامل أساسي في نمو المجتمع وارتقاء إنسانه.",
      vision: 'صحافة مهنية حرة أولويتها الإنسان.',
      mission: 'أن نصبح المؤسسة الأولى في تعزيز حرية الصحافة وحمل مطالبها والدفاع عن استحقاقاتها وحضورها وتعزيز دورها في الدفاع عن الإنسان أولاً وأخيراً.',
      objectives: [
        'إيجاد مساحات نقاش عملية ومهنية للصحفيات والصحفيين.',
        'توفير حاضنة أعمال صحفية لتحسين جودة حياتهم.',
        'الدفاع عن حرية الصحافة والسعي لتطوير العمل الصحفي.',
        'تقديم صحافة مهنية متطورة تخدم الإنسان أولاً وأخيراً.',
        'الارتقاء بقدرات الصحفيات والصحفيين في مختلف المجالات.',
        'تفعيل القدرات التقييمية لتطوير المادة الإعلامية.',
        'خلق آليات شراكة وتشبيك مع الجامعات.',
        'المساهمة في رصد الانتهاكات ضد الصحفيين.',
        'ربط المجتمع الصحفي اليمني بنظرائه في الدول العربية والعالم.'
      ]
    };
  }
}
