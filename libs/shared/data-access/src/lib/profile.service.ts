import { supabase } from '../supabase';
import type { UserProfile } from '@libs/shared/types/auth.types';

export class ProfileService {
  async createProfile(id: string, email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id, email })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
