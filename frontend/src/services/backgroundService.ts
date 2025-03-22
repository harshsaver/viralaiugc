import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Background = {
  id: number;
  image_link: string;
  thumbnail: string | null;
  created_at: string;
  user_id: string | null;
};

export const fetchBackgrounds = async (): Promise<Background[]> => {
  const { data, error } = await supabase
    .from('backgrounds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching backgrounds:', error);
    throw error;
  }

  return data || [];
};

export const fetchBackgroundById = async (id: number): Promise<Background | null> => {
  const { data, error } = await supabase
    .from('backgrounds')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching background:', error);
    throw error;
  }

  return data;
};

export const createBackground = async (
  userId: string,
  imageLink: string,
  thumbnail: string | null = null
): Promise<Background | null> => {
  if (!userId) {
    console.error('User ID is required to create a background');
    return null;
  }

  const { data, error } = await supabase
    .from('backgrounds')
    .insert({
      user_id: userId,
      image_link: imageLink,
      thumbnail: thumbnail
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating background:', error);
    throw error;
  }

  return data;
};

export const deleteBackground = async (backgroundId: number): Promise<void> => {
  const { error } = await supabase
    .from('backgrounds')
    .delete()
    .eq('id', backgroundId);

  if (error) {
    console.error('Error deleting background:', error);
    throw error;
  }
};
