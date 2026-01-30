
import { Injectable, signal, inject } from '@angular/core';
import { Tool } from '../models/tool.model';
import { LoggerService } from './logger.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  tools = signal<Tool[]>([
    // 1. AI Core & Specialized Agents
    {
      id: 'ai-assistant', name: 'YemenJPT-Cloud', englishName: 'YemenJPT Cloud Model', category: 'النواة المعرفية والتحليل الذكي',
      description: 'المساعد الذكي المتقدم للصحفيين. يساعد في صياغة العناوين، التلخيص، والتحليل العميق.',
      iconSvg: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z',
      iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief', 'public'],
    },
    {
      id: 'dastoor-meter', name: 'دستور-ميتر', englishName: 'Constitution Meter', category: 'المساءلة والرقابة',
      description: 'مرصد آلي لرصد وتحليل مخالفات المسؤولين للدستور والقانون، مع نظام تنقيط ومؤشرات حية.',
      iconSvg: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
      iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief']
    },
    {
      id: 'whisper', name: 'Whisper-YE', englishName: 'Audio Transcription', category: 'النواة المعرفية والتحليل الذكي',
      description: 'تفريغ المقابلات الطويلة، التسريبات الصوتية، ومحاضر الاجتماعات تلقائياً.',
      iconSvg: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM17 8h-1.35c-.32 3.11-2.94 5.5-6.15 5.5S3.67 11.11 3.35 8H2c.36 3.82 3.24 6.88 7 7.29V19H5v2h14v-2h-4v-3.71c3.76-.41 6.64-3.47 7-7.29z',
      iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'],
    },
    { 
      id: 'libretranslate', name: 'الترجمة الآمنة', englishName: 'LibreTranslate', category: 'النواة المعرفية والتحليل الذكي',
      description: 'ترجمة الوثائق الأجنبية الحساسة دون إرسال البيانات لسيرفرات خارجية (مثل Google).',
      iconSvg: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.287 7.5 15.5 7.5c1.213 0 2.32-.439 3.166-1.136m0 0 is greater than 3.032 3.032 0 0 1-3.675 3.675-3.032 3.032 0 0 1-3.675-3.675M12 12.75h.008v.008H12v-.008Z', 
      iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'] 
    },
    { 
      id: 'langfuse', name: 'مراقب الجودة (Langfuse)', englishName: 'AI Quality Monitoring', category: 'النواة المعرفية والتحليل الذكي',
      description: 'تحليل ومراقبة جودة مخرجات الذكاء الاصطناعي، وتوفير حلقة تغذية راجعة لتطوير النماذج.',
      iconSvg: 'M7.5 14.25v-2.5h1.5v2.5h-1.5Zm3 0v-6.5h1.5v6.5h-1.5Zm3 0v-4.5h1.5v4.5h-1.5Zm3 0V7.5h1.5V14.25h-1.5Z M3.375 3h17.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125Z', 
      iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin'] 
    },
    { 
      id: 'gensim', name: 'YemenJPT-NLP', englishName: 'NLP Models', category: 'النواة المعرفية والتحليل الذكي',
      description: 'للتحقيقات المتقدمة: تحليل وفهم سياق آلاف الوثائق النصية واستخراج العلاقات بينها.',
      iconSvg: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12', 
      iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist'] 
    },
    { 
      id: 'quaily-ai', name: 'المحرر الصحفي (Quaily)', englishName: 'AI Editorial Assistant', category: 'النواة المعرفية والتحليل الذكي',
      description: 'مساعد ذكي مدرب على دليل التحرير الخاص بالمؤسسة لضمان اتساق "النبرة" والمصطلحات.',
      iconSvg: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125',
      iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['editor-in-chief', 'super-admin']
    },

    // 2. OSINT & Verification
    { 
      id: 'searxng', 
      name: 'محرك البحث الاستقصائي', 
      englishName: 'SearXNG Metasearch', 
      category: 'التقصي والاستخبارات مفتوحة المصدر', 
      description: 'محرك بحث يجمع النتائج من مصادر متعددة دون تتبع. يستخدم للبحث الأولي الآمن عن المعلومات دون كشف هوية المحقق.', 
      iconSvg: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', 
      iconColor: 'text-gray-500', 
      isActive: true, 
      isFavorite: true, 
      isVisiblePublicly: true, 
      allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief', 'public'] 
    },
    { 
      id: 'spiderfoot', 
      name: 'أداة SpiderFoot', 
      englishName: 'OSINT Automation', 
      category: 'التقصي والاستخبارات مفتوحة المصدر', 
      description: 'أداة أتمتة لجمع المعلومات الاستخباراتية (OSINT). تستخدم لمسح الأهداف (عناوين IP، نطاقات، بريد إلكتروني) وجمع بيانات مترابطة من مئات المصادر العامة.', 
      iconSvg: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0', 
      iconColor: 'text-gray-500', 
      isActive: true, 
      isFavorite: false, 
      isVisiblePublicly: true, 
      allowedRoles: ['super-admin', 'investigative-journalist'] 
    },
    { id: 'newsleak', name: 'New/s/leak', englishName: 'Leak Analysis', category: 'التقصي والاستخبارات مفتوحة المصدر', description: 'أداة قوية لتحليل الوثائق المسربة (مثل وثائق بنما) ورسم خرائط العلاقات بين الأسماء.', iconSvg: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75M14.25 15.75l3.75 3.75', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist'] },
    { id: 'changedetection', name: 'راصد التغييرات', englishName: 'ChangeDetection.io', category: 'التقصي والاستخبارات مفتوحة المصدر', description: 'تلقي تنبيه عند تغيير أي كلمة في صفحة ويب (حذف تصريح رسمي، تغيير سعر).', iconSvg: 'M12 4.5C7.305 4.5 3.197 7.633 1.5 12c1.697 4.367 5.805 7.5 10.5 7.5s8.803-3.133 10.5-7.5C20.803 7.633 16.695 4.5 12 4.5zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'] },

    // 3. Social Media Analysis
    { id: 'sherlock-maigret', name: 'أداة Sherlock', englishName: 'Username Search', category: 'تحليل الإعلام الاجتماعي', description: 'البحث عن اسم مستخدم معين (Username) عبر مئات المنصات الاجتماعية لكشف حسابات الهدف.', iconSvg: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.683c.65-.935 1-2.104 1-3.328M3 4.5a5.25 5.25 0 0 1 10.5 0v.75a5.25 5.25 0 0 1-10.5 0v-.75z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'], },
    { id: 'social-analyzer', name: 'المحلل الاجتماعي', englishName: 'Social Analyzer', category: 'تحليل الإعلام الاجتماعي', description: 'تحليل سلوك حساب معين، أوقات نشاطه، ومن يتفاعل معه.', iconSvg: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist'] },
    
    // 4. Verification & Forensics
    { id: 'invid-weverify', name: 'مختبر التحقق (InVID)', englishName: 'InVID/WeVerify Toolkit', category: 'التحقق وكشف التزييف', description: 'تجزئة الفيديوهات إلى صور للبحث العكسي، وكشف التلاعب في البيانات الوصفية (Metadata).', iconSvg: 'm15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    { id: 'meedan-check', name: 'منصة Meedan Check', englishName: 'Fact-Checking Platform', category: 'التحقق وكشف التزييف', description: 'منصة عمل جماعي لاستقبال الشائعات، التحقق منها، ونشر النتائج للجمهور.', iconSvg: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['editor-in-chief', 'super-admin'] },
    { id: 'fotoforensics', name: 'تحليل ELA للصور', englishName: 'FotoForensics (ELA)', category: 'التحقق وكشف التزييف', description: 'تحليل مستوى الخطأ في ضغط الصور (ELA) لكشف التلاعب والتعديلات الرقمية التي لا ترى بالعين المجردة.', iconSvg: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    { id: 'exiftool', name: 'مستخرج البيانات الوصفية', englishName: 'ExifTool Metadata Analysis', category: 'التحقق وكشف التزييف', description: 'استخراج وتحليل البيانات الوصفية (Metadata) من الصور والفيديوهات لكشف معلومات مثل نوع الكاميرا وإحداثيات GPS.', iconSvg: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },

    // 5. Geo-Intelligence
    { id: 'ushahidi', name: 'منصة Ushahidi', englishName: 'Crowdsourcing Platform', category: 'الخرائط والرصد الجغرافي', description: 'إنشاء خريطة تفاعلية لرصد الانتهاكات أو الأحداث (مثل انقطاع الخدمات) بناءً على بلاغات الجمهور.', iconSvg: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'] },
    { id: 'kepler', name: 'محلل Kepler.gl', englishName: 'Geospatial Analysis', category: 'الخرائط والرصد الجغرافي', description: 'تحويل جداول البيانات الضخمة (Excel) إلى خرائط ثلاثية الأبعاد تفاعلية ومذهلة بصرياً.', iconSvg: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist'] },
    { id: 'nasa-firms', name: 'راصد الحرائق (NASA FIRMS)', englishName: 'Fire Information for Resource Management', category: 'الخرائط والرصد الجغرافي', description: 'كشف مناطق القصف والاشتباكات عبر تحليل بيانات الأقمار الصناعية الحرارية من وكالة ناسا بشكل شبه لحظي.', iconSvg: 'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.287 8.287 0 0 0 3-2.555 8.252 8.252 0 0 1 3.362-1.832Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    
    // 6. Financial & Corporate
    { id: 'openduka', name: 'كاشف الشركات', englishName: 'OpenDuka', category: 'التحقيقات المالية والشركات', description: 'قاعدة بيانات للشركات لكشف من يملك ماذا، وربط الشخصيات بالكيانات التجارية.', iconSvg: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M15 21v-3.375c0-.621-.504-1.125-1.125-1.125H10.125c-.621 0-1.125.504-1.125 1.125V21', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist'] },

    // 7. Archiving & Data Vaults
    { id: 'archivebox', name: 'أرشيف الويب الدائم', englishName: 'ArchiveBox', category: 'الأرشفة والتوثيق الرقمي', description: 'حفظ نسخة "قانونية" من صفحات الويب والتغريدات كدليل قبل أن يتم حذفها.', iconSvg: 'M3.75 9.75h16.5v1.5H3.75v-1.5Z M4.5 3.75h15v1.5h-15v-1.5Z M3 19.5h18V21H3v-1.5Z M3.75 14.25h16.5v1.5H3.75v-1.5Z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'investigative-journalist', 'editor-in-chief'] },
    { id: 'nocodb', name: 'قاعدة بيانات الانتهاكات', englishName: 'Violations Database', category: 'الأرشفة والتوثيق الرقمي', description: 'نظام لتوثيق وأرشفة الانتهاكات ضد الصحفيين لغرض التقارير الحقوقية.', iconSvg: 'M3 7.5h18M3 12h18m-9 4.5h9M3.75 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },

    // 8. Communication & Workflow
    { id: 'mattermost', name: 'منصة التعاون (Mattermost)', englishName: 'Team Collaboration', category: 'التواصل وسير العمل', description: 'التواصل الداخلي الآمن والمشفر بين أعضاء الفريق بعيداً عن الرقابة.', iconSvg: 'M12 20.25c.966 0 1.896-.166 2.774-.474a11.232 11.232 0 0 1-5.548 0c.878.308 1.808.474 2.774.474ZM12 4.5a.75.75 0 0 0-.75.75v3.669a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-3.669a.75.75 0 0 1 1.5 0v3.669a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75h-.008ZM12 11.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    { id: 'nextcloud', name: 'المكتب السحابي (Nextcloud)', englishName: 'Nextcloud Hub', category: 'التواصل وسير العمل', description: 'مشاركة المستندات وتخزين مسودات التحقيقات بأمان (بديل Google Drive).', iconSvg: 'M12 4.5C9.507 4.5 7.422 6.01 6.5 8.016A4.5 4.5 0 0 0 4.5 15.5H19.5a3.5 3.5 0 0 0 .5-6.965C19.18 6.556 15.82 4.5 12 4.5z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    
    // 9. Advanced Cyber Security
    { id: 'webtop', name: 'المتصفح الآمن', englishName: 'Secure Browser (Webtop)', category: 'الأمن السيبراني المتقدم', description: 'فتح الروابط المشبوهة داخل بيئة معزولة (Sandbox) لحماية جهاز الصحفي من الاختراق.', iconSvg: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M10.5 3.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z M15 6.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z M18.75 10.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5Z M6.75 15a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['investigative-journalist', 'editor-in-chief', 'super-admin'] },
    
    // other categories...
    { id: 'n8n', name: 'منصة الأتمتة (n8n)', englishName: 'Workflow Automation', category: 'الأتمتة وسير العمل', description: 'ربط التطبيقات المختلفة لإنشاء تدفقات عمل آلية (مثلاً: عند رصد انتهاك جديد، أرسل تنبيه).', iconSvg: 'M12.5,8H11v6l4.7,2.9l0.8-1.2l-4-2.4V8z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S16.4,20,12,20z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin'] },
    { id: 'superdesk', name: 'إدارة المحتوى (Superdesk)', englishName: 'Superdesk CMS', category: 'إدارة غرفة الأخبار والنشر', description: 'قلب غرفة الأخبار؛ استقبال الخيوط الصحفية، توزيع المهام، ومراجعة المقالات (Workflow).', iconSvg: 'M3.75 9.75h16.5v1.5H3.75v-1.5Zm0-4.5h16.5v1.5H3.75v-1.5Zm0 9h16.5v1.5H3.75v-1.5Zm-1.5 6h19.5v1.5H2.25v-1.5Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['editor-in-chief', 'super-admin'] },
    { id: 'ghost-ye', name: 'منصة النشر (Ghost-YE)', englishName: 'Ghost Publishing Platform', category: 'إدارة غرفة الأخبار والنشر', description: 'نشر المقالات والتحقيقات للجمهور بتصميم حديث وسريع (واجهة القارئ).', iconSvg: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z', iconColor: 'text-gray-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['editor-in-chief', 'super-admin'] },
    { id: 'openproject', name: 'تخطيط المشاريع (OpenProject)', englishName: 'OpenProject', category: 'إدارة المشاريع المؤسسية', description: 'متابعة تقدم التحقيقات الاستقصائية طويلة المدى والجداول الزمنية.', iconSvg: 'M9 12.75 11.25 15 15 9.75M21 12c0 4.556-4.03 8.25-9 8.25s-9-3.694-9-8.25 4.03-8.25 9-8.25 9 3.694 9 8.25Z', iconColor: 'text-gray-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['editor-in-chief', 'super-admin'] },
  ]);

  toggleToolStatus(toolId: string) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
      )
    );
    const tool = this.tools().find(t => t.id === toolId);
    if (tool) {
        this.logger.logEvent(
            `Tool Status Changed: ${tool.name}`,
            `New status: ${tool.isActive ? 'Active' : 'Inactive'}`,
            this.userService.currentUser()?.name,
            this.userService.currentUser()?.role === 'super-admin'
        );
    }
  }

  toggleFavoriteStatus(toolId: string) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, isFavorite: !tool.isFavorite } : tool
      )
    );
  }

  updateTool(toolId: string, updates: Partial<Tool>) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, ...updates } : tool
      )
    );
  }
}