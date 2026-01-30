
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Budget {
  category: string;
  allocated: number;
  spent: number;
  currency: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Vehicle' | 'Furniture';
  assignedTo: string;
  status: 'Active' | 'Maintenance' | 'Retired';
  purchaseDate: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  date: string;
  category: string;
}

@Component({
  selector: 'app-erp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './erp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErpComponent {
  // Financial State
  budgets = signal<Budget[]>([
    { category: 'رواتب الموظفين', allocated: 120000, spent: 45000, currency: 'USD' },
    { category: 'العمليات واللوجستيات', allocated: 50000, spent: 32000, currency: 'USD' },
    { category: 'تراخيص البرمجيات والسيرفرات', allocated: 15000, spent: 12000, currency: 'USD' },
    { category: 'منح التحقيقات الاستقصائية', allocated: 80000, spent: 25000, currency: 'USD' },
  ]);

  transactions = signal<Transaction[]>([
    { id: 1, description: 'دفعة منحة (NED)', amount: 50000, type: 'Income', date: '2024-07-01', category: 'Grants' },
    { id: 2, description: 'تجديد اشتراك خوادم Hetzner', amount: 450, type: 'Expense', date: '2024-07-05', category: 'Technology' },
    { id: 3, description: 'رواتب شهر يونيو', amount: 12500, type: 'Expense', date: '2024-07-02', category: 'Salaries' },
    { id: 4, description: 'شراء معدات تصوير', amount: 3200, type: 'Expense', date: '2024-06-28', category: 'Equipment' },
  ]);

  assets = signal<Asset[]>([
    { id: 'AST-001', name: 'MacBook Pro M2', type: 'Hardware', assignedTo: 'أحمد خالد', status: 'Active', purchaseDate: '2023-05-15' },
    { id: 'AST-002', name: 'Canon EOS R5', type: 'Hardware', assignedTo: 'قسم الملتيميديا', status: 'Active', purchaseDate: '2023-06-20' },
    { id: 'AST-003', name: 'Starlink Kit', type: 'Hardware', assignedTo: 'فريق عدن', status: 'Maintenance', purchaseDate: '2024-01-10' },
    { id: 'AST-004', name: 'رخصة Maltego Classic', type: 'Software', assignedTo: 'وحدة التحقق', status: 'Active', purchaseDate: '2024-02-01' },
  ]);

  // Computed Metrics
  totalBudget = computed(() => this.budgets().reduce((acc, curr) => acc + curr.allocated, 0));
  totalSpent = computed(() => this.budgets().reduce((acc, curr) => acc + curr.spent, 0));
  burnRate = computed(() => Math.round((this.totalSpent() / this.totalBudget()) * 100));
  
  activeAssetsCount = computed(() => this.assets().filter(a => a.status === 'Active').length);

  getProgressColor(percentage: number): string {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
