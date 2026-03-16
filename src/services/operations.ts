
import { Database, ref, push, remove, serverTimestamp } from 'firebase/database';
import { Asset, HealthRecord, MealPlan, School } from '@/lib/types';

export const operationsService = {
  // Asset Management
  async addAsset(db: Database, data: Omit<Asset, 'id' | 'createdAt'>) {
    return push(ref(db, 'assets'), {
      ...data,
      status: 'Active',
      createdAt: serverTimestamp()
    });
  },
  async deleteAsset(db: Database, id: string) {
    return remove(ref(db, `assets/${id}`));
  },
  // Health Records
  async logClinicVisit(db: Database, data: Omit<HealthRecord, 'id' | 'createdAt'>) {
    return push(ref(db, 'health_records'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteHealthRecord(db: Database, id: string) {
    return remove(ref(db, `health_records/${id}`));
  },
  // Catering
  async addMealPlan(db: Database, data: Omit<MealPlan, 'id' | 'createdAt'>) {
    return push(ref(db, 'meal_plans'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteMealPlan(db: Database, id: string) {
    return remove(ref(db, `meal_plans/${id}`));
  },
  // Transport
  async addRoute(db: Database, data: any) {
    return push(ref(db, 'transport_routes'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteRoute(db: Database, id: string) {
    return remove(ref(db, `transport_routes/${id}`));
  },
  // Multi-school
  async registerSchool(db: Database, data: Omit<School, 'id' | 'createdAt'>) {
    return push(ref(db, 'schools'), {
      ...data,
      status: 'Active',
      createdAt: serverTimestamp()
    });
  },
  async deleteSchool(db: Database, id: string) {
    return remove(ref(db, `schools/${id}`));
  }
};
