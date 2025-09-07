import { useState, useEffect } from "react";
import { Search, Filter, Car, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { CarCard } from "../components/CarCard";
import { useAuthStore } from "../store/auth";
import type { ListingDetail, SearchFilters } from "../types";
import { ListingService } from "../services/listing.service";
import { useMetadata } from "../services/metadata.service";

export function HomePage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { metadata } = useMetadata();

  useEffect(() => {
    fetchListings();

    // Refresh favorite states when user comes back to the page
    const handleFocus = () => {
      // Force re-render of CarCard components to refresh favorite states
      setListings((prev) => [...prev]);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = (await ListingService.getListings()) as {
        listings: ListingDetail[];
      };
      setListings(response.listings || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      fetchListings();
      return;
    }

    try {
      setLoading(true);
      const searchFilters: SearchFilters = {
        ...filters,
        ...(searchQuery.trim() && {
          make: searchQuery,
          model: searchQuery,
        }),
      };

      const response = await ListingService.searchListings(searchFilters);
      setListings(response.listings || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setShowFilters(false);
    fetchListings();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Car
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Browse thousands of quality used cars from trusted sellers
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by make, model, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg text-gray-900 bg-white"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Cars</h2>
            <div className="flex space-x-2">
              {(Object.keys(filters).length > 0 || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && metadata && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Make & Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make
                    </label>
                    <select
                      value={filters.make || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          make: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Make</option>
                      {metadata.makes?.map((make) => (
                        <option key={make.id} value={make.name}>
                          {make.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <Input
                      type="text"
                      placeholder="Any Model"
                      value={filters.model || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          model: e.target.value || undefined,
                        })
                      }
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range ($)
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            priceMin: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            priceMax: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Range
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="From"
                        value={filters.yearMin || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            yearMin: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="To"
                        value={filters.yearMax || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            yearMax: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Mileage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Mileage (miles)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={filters.mileageMax || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          mileageMax: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={filters.fuelType || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          fuelType: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Fuel</option>
                      {metadata.fuelTypes.map((type) => (
                        <option key={type.id} value={type.value}>
                          {type.displayValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body Type
                    </label>
                    <select
                      value={filters.bodyType || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          bodyType: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Body Type</option>
                      {metadata.bodyTypes.map((type) => (
                        <option key={type.id} value={type.value}>
                          {type.displayValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission
                    </label>
                    <select
                      value={filters.transmission || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          transmission: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Transmission</option>
                      {metadata.transmissionTypes.map((type) => (
                        <option key={type.id} value={type.value}>
                          {type.displayValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="City or State"
                      value={filters.location || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          location: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters ({Object.keys(filters).length} active)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 6).map((listing) => (
                <CarCard
                  key={`${listing.id}-${user?.id || "anonymous"}`}
                  listing={listing}
                />
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cars found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CarMarket?
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of buyers and sellers nationwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                10,000+
              </div>
              <div className="text-lg text-gray-600">Cars Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                50,000+
              </div>
              <div className="text-lg text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-lg text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
