"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Brand } from "@/types/brands";
import AddBrandModal from "@/components/AddBrandModal";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch brands from Supabase
  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('brands')
        .select('*')
        .is('deletedat', null) // Only get non-deleted brands
        .order('createdat', { ascending: true });

      if (supabaseError) throw supabaseError;
      setBrands(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch brands");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.brandname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandAdded = (newBrand: Brand) => {
    setBrands(prev => [newBrand, ...prev]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const { error: supabaseError } = await supabase
        .from('brands')
        .update({
          deletedat: new Date().toISOString(),
          deletedby: 'current_user' // Replace with actual user
        })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      // Remove from local state
      setBrands(prev => prev.filter(brand => brand.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete brand");
    }
  };

  const handleUpdate = async (id: number, newName: string) => {
    if (!newName.trim()) return;

    try {
      const { error: supabaseError } = await supabase
        .from('brands')
        .update({
          brandname: newName.trim(),
          updatedat: new Date().toISOString(),
          updatedby: 'current_user' // Replace with actual user
        })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      // Update local state
      setBrands(prev => prev.map(brand => 
        brand.id === id 
          ? { ...brand, brandname: newName.trim(), updatedat: new Date().toISOString() }
          : brand
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update brand");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Brand Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and view all brands in your inventory
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar and Create Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Create
            </button>
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600 dark:text-gray-300">Loading brands...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 dark:text-red-400">{error}</div>
              <button 
                onClick={fetchBrands}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Brand ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBrands.map((brand) => (
                    <BrandRow 
                      key={brand.id} 
                      brand={brand} 
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>

              {filteredBrands.length === 0 && !isLoading && (
                <div className="p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No brands found matching your search." : "No brands found."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBrandAdded={handleBrandAdded}
      />
    </div>
  );
}

// Brand Row Component with inline editing
function BrandRow({ 
  brand, 
  onUpdate, 
  onDelete 
}: { 
  brand: Brand; 
  onUpdate: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(brand.brandname);

  const handleSave = () => {
    if (editName.trim() !== brand.brandname) {
      onUpdate(brand.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(brand.brandname);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {brand.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
          />
        ) : (
          brand.brandname
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Update
              </button>
              <button
                onClick={() => onDelete(brand.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}