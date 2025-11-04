"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Brand } from "@/types/brands";

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandAdded: (brand: Brand) => void;
}

export default function AddBrandModal({ isOpen, onClose, onBrandAdded }: AddBrandModalProps) {
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError("Brand name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: supabaseError } = await supabase
        .from('brands')
        .insert([
          {
            brandname: brandName.trim(),
            createdby: 'current_user', 
            createdat: new Date().toISOString(),
            updatedat: null,
            updatedby: null,
            deletedat: null,
            deletedby: null
          }
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      onBrandAdded(data);
      setBrandName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add brand");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Add New Brand
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter brand name"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}