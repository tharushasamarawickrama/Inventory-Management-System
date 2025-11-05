"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Brand } from "@/types/brands";
import AddBrandModal from "@/components/AddBrandModal";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    brandId: 0,
    brandName: "",
    isDeleting: false
  });

  // Fetch brands from Supabase with pagination
  const fetchBrands = async (page = 1, perPage = recordsPerPage, search = searchTerm) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .is('deletedat', null);

      // Add search filter if search term exists
      if (search.trim()) {
        query = query.ilike('brandname', `%${search.trim()}%`);
      }

      // Add pagination only if not showing all records
      if (perPage !== -1) {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
      }

      query = query.order('id', { ascending: true });

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) throw supabaseError;
      
      setBrands(data || []);
      setTotalRecords(count || 0);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch brands");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(currentPage, recordsPerPage, searchTerm);
  }, [currentPage, recordsPerPage]);

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchBrands(1, recordsPerPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Calculate pagination info
  const totalPages = recordsPerPage === -1 ? 1 : Math.ceil(totalRecords / recordsPerPage);
  const startRecord = recordsPerPage === -1 ? 1 : (currentPage - 1) * recordsPerPage + 1;
  const endRecord = recordsPerPage === -1 ? totalRecords : Math.min(currentPage * recordsPerPage, totalRecords);

  const handleBrandAdded = (newBrand: Brand) => {
    setTotalRecords(prev => prev + 1);
    fetchBrands(currentPage, recordsPerPage, searchTerm);
  };

  // Open confirmation modal
  const handleDeleteClick = (id: number, brandName: string) => {
    setConfirmationModal({
      isOpen: true,
      brandId: id,
      brandName: brandName,
      isDeleting: false
    });
  };

  // Close confirmation modal
  const handleDeleteCancel = () => {
    setConfirmationModal({
      isOpen: false,
      brandId: 0,
      brandName: "",
      isDeleting: false
    });
  };

  // Confirm deletion
  const handleDeleteConfirm = async () => {
    try {
      setConfirmationModal(prev => ({ ...prev, isDeleting: true }));

      const { error: supabaseError } = await supabase
        .from('brands')
        .update({
          deletedat: new Date().toISOString(),
          deletedby: 'current_user'
        })
        .eq('id', confirmationModal.brandId);

      if (supabaseError) throw supabaseError;
      
      // Remove from local state
      setBrands(prev => prev.filter(brand => brand.id !== confirmationModal.brandId));
      setTotalRecords(prev => prev - 1);
      
      // Close modal
      handleDeleteCancel();
      
    } catch (err) {
      // Handle error
      setConfirmationModal(prev => ({ ...prev, isDeleting: false }));
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
          updatedby: 'current_user'
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

  const handleRecordsPerPageChange = (newPerPage: number) => {
    setRecordsPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              Create Brand
            </button>
          </div>
        </div>

        {/* Records Info */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
              <span>
                Showing {startRecord} to {endRecord} of {totalRecords} records
              </span>
              {recordsPerPage !== -1 && (
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>
        )}

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
                onClick={() => fetchBrands(currentPage, recordsPerPage, searchTerm)}
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
                  {brands.map((brand) => (
                    <BrandRow 
                      key={brand.id} 
                      brand={brand} 
                      onUpdate={handleUpdate}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>

              {brands.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No brands found matching your search." : "No brands found."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Pagination and Records Per Page */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-6">
            {/* When pagination is available */}
            {recordsPerPage !== -1 && totalPages > 1 ? (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Pagination Controls */}
                <div className="flex items-center gap-2 order-2 lg:order-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-2">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                        disabled={page === '...'}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                            ? 'text-gray-400 dark:text-gray-500 cursor-default'
                            : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>

                {/* Records Per Page Dropdown */}
                <div className="flex items-center gap-2 order-1 lg:order-2">
                  <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Records per page:
                  </label>
                  <select
                    id="recordsPerPage"
                    value={recordsPerPage}
                    onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={-1}>All</option>
                  </select>
                </div>
              </div>
            ) : (
              /* When no pagination (single page or "All records" mode) */
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Records per page:
                  </label>
                  <select
                    id="recordsPerPage"
                    value={recordsPerPage}
                    onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={-1}>All</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBrandAdded={handleBrandAdded}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        message={`Are you sure you want to delete "${confirmationModal.brandName}"? This action cannot be undone.`}
        confirmText="Delete Brand"
        cancelText="Cancel"
        type="danger"
        isLoading={confirmationModal.isDeleting}
      />
    </div>
  );
}

// Brand Row Component remains the same
function BrandRow({ 
  brand, 
  onUpdate, 
  onDelete 
}: { 
  brand: Brand; 
  onUpdate: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
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
                onClick={() => onDelete(brand.id, brand.brandname)}
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