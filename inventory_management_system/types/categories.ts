export interface Category {
  id: number;
  categoryname: string;
  brandid: number;
  createdat: string;
  createdby: string;
  updatedat: string | null;
  updatedby: string | null;
  deletedat: string | null;
  deletedby: string | null;
}

export type CategoryInsert = Omit<Category, 'id' | 'createdat'>;
export type CategoryUpdate = Partial<CategoryInsert>;
