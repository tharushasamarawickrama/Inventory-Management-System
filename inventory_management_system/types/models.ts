export interface Model {
  id: number;
  modelname: string;
  categoryid: number;
  createdat: string;
  createdby: string;
  updatedat: string | null;
  updatedby: string | null;
  deletedat: string | null;
  deletedby: string | null;
}

export type ModelInsert = Omit<Model, 'id' | 'createdat'>;
export type ModelUpdate = Partial<ModelInsert>;
