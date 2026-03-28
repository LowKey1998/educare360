import { Database, ref, get, set, update, remove, push } from 'firebase/database';
import { CustomRole } from '@/lib/types';

export const rolesService = {
  async getRoles(database: Database): Promise<CustomRole[]> {
    const rolesRef = ref(database, 'roles');
    const snapshot = await get(rolesRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },

  async addRole(database: Database, role: Omit<CustomRole, 'id' | 'createdAt'>) {
    const rolesRef = ref(database, 'roles');
    const newRoleRef = push(rolesRef);
    
    await set(newRoleRef, {
      ...role,
      createdAt: Date.now()
    });
    
    return newRoleRef.key;
  },

  async updateRole(database: Database, id: string, updates: Partial<CustomRole>) {
    const roleRef = ref(database, `roles/${id}`);
    await update(roleRef, updates);
  },

  async deleteRole(database: Database, id: string) {
    const roleRef = ref(database, `roles/${id}`);
    await remove(roleRef);
  }
};
