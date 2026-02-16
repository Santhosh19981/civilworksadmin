import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CoreService {
    private products = new BehaviorSubject<any[]>([]);
    private categories = new BehaviorSubject<any[]>([]);
    private rentals = new BehaviorSubject<any[]>([]);
    private orders = new BehaviorSubject<any[]>([]);
    private payments = new BehaviorSubject<any[]>([]);
    private customers = new BehaviorSubject<any[]>([]);
    private helpers = new BehaviorSubject<any[]>([]);
    private settings = new BehaviorSubject<any>({
        deliveryCharge: 50,
        taxPercent: 12,
        enableCOD: true,
        themeColor: '#0B2C4D'
    });

    constructor(private http: HttpClient) {
        this.initData();
    }

    private initData() {
        this.loadFromStorageOrJson('products', 'assets/data/products.json', this.products);
        this.loadFromStorageOrJson('categories', 'assets/data/categories.json', this.categories);
        this.loadFromStorageOrJson('rentals', 'assets/data/rentals.json', this.rentals);
        this.loadFromStorageOrJson('orders', 'assets/data/orders.json', this.orders);
        this.loadFromStorageOrJson('payments', 'assets/data/payments.json', this.payments);
        this.loadFromStorageOrJson('customers', 'assets/data/customers.json', this.customers);
        this.loadFromStorageOrJson('helpers', 'assets/data/helpers.json', this.helpers);

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings.next(JSON.parse(savedSettings));
        }
    }

    private loadFromStorageOrJson(key: string, jsonPath: string, subject: BehaviorSubject<any[]>) {
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : null;

        // Force reload from JSON if data is invalid or using old schema for 'helpers'
        const isHelpersSchemaInvalid = key === 'helpers' && parsed && parsed.length > 0 && !parsed[0].serviceName;

        if (parsed && Array.isArray(parsed) && parsed.length > 0 && !isHelpersSchemaInvalid) {
            subject.next(parsed);
        } else {
            this.http.get<any[]>(jsonPath).subscribe({
                next: (data) => this.save(key, data, subject),
                error: (err) => console.error(`Error loading ${key}:`, err)
            });
        }
    }

    private save(key: string, data: any, subject: BehaviorSubject<any>) {
        localStorage.setItem(key, JSON.stringify(data));
        subject.next(data);
    }

    // Generic CRUD
    getData(key: 'products' | 'categories' | 'rentals' | 'orders' | 'payments' | 'customers' | 'settings' | 'helpers'): Observable<any> {
        switch (key) {
            case 'products': return this.products.asObservable();
            case 'categories': return this.categories.asObservable();
            case 'rentals': return this.rentals.asObservable();
            case 'orders': return this.orders.asObservable();
            case 'payments': return this.payments.asObservable();
            case 'customers': return this.customers.asObservable();
            case 'helpers': return this.helpers.asObservable();
            case 'settings': return this.settings.asObservable();
        }
    }

    addItem(key: string, item: any) {
        const subject = (this as any)[key];
        const current = subject.value;
        const newData = [...current, { ...item, id: Date.now() }];
        this.save(key, newData, subject);
    }

    updateItem(key: string, id: any, updates: any) {
        const subject = (this as any)[key];
        const current = subject.value;
        const index = current.findIndex((i: any) => i.id === id || i.orderId === id || i.transactionId === id);
        if (index > -1) {
            const newData = [...current];
            newData[index] = { ...newData[index], ...updates };
            this.save(key, newData, subject);
        }
    }

    deleteItem(key: string, id: any) {
        const subject = (this as any)[key];
        const current = subject.value;
        const newData = current.filter((i: any) => i.id !== id);
        this.save(key, newData, subject);
    }

    updateSettings(newSettings: any) {
        this.save('settings', newSettings, this.settings);
    }
}
