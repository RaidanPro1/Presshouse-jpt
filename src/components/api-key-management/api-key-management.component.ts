import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ApiService {
  name: string;
  keyName: string;
  value: string; // Empty string means missing, 'configured_but_hidden' means set but not shown
}

@Component({
  selector: 'app-api-key-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-key-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyManagementComponent {
  
  // This is a simulation. In a real app, this status would come from a secure backend check.
  apiServices = signal<ApiService[]>([
    {
      name: 'Google Gemini API',
      keyName: 'API_KEY',
      value: 'configured_but_hidden',
    },
    {
      name: 'Cloudflare API',
      keyName: 'CF_TOKEN',
      value: 'configured_but_hidden',
    },
     {
      name: 'MediaCloud API',
      keyName: 'MEDIACLOUD_API_KEY',
      value: '', // This one is missing
    },
  ]);

  saveKeys() {
    // In a real application, this would make a secure backend call to update the .env file or a secure config store.
    // **NEVER** handle sensitive keys directly in the frontend like this in production.
    console.log('Simulating saving API keys:', this.apiServices());
    
    this.apiServices.update(services => 
      services.map(s => {
        if(s.value && s.value !== 'configured_but_hidden') {
          // A new key was entered. Simulate saving it.
          return {...s, value: 'configured_but_hidden'};
        }
        return s;
      })
    );
  }
  
  updateServiceValue(index: number, newValue: string) {
    this.apiServices.update(currentServices => {
      // Create a new array with the updated item
      return currentServices.map((service, i) => {
        if (i === index) {
          return { ...service, value: newValue };
        }
        return service;
      });
    });
  }
}
