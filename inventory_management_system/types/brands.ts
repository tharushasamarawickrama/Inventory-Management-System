export interface Brand {
  id: number;
  brandname: string;
  createdat: string;
  createdby: string;
  updatedat: string | null;
  updatedby: string | null;
  deletedat: string | null;
  deletedby: string | null;
}

export type BrandInsert = Omit<Brand, 'id' | 'createdat'>;
export type BrandUpdate = Partial<BrandInsert>;