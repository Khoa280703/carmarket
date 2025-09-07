import { useState, useEffect } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { CarCard } from "../components/CarCard";
import { FavoritesService } from "../services/favorites.service";
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";
import type { ListingDetail } from "../types";

export function FavoritesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [favorites, setFavorites] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      console.log("Fetching favorites for page:", page);

      const response = await FavoritesService.getUserFavorites(page, 12);

      console.log("Raw API response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response || {}));
      console.log("Favorites array:", response?.favorites);
      console.log("Favorites length:", response?.favorites?.length);
      console.log("Pagination:", response?.pagination);

      if (response && response.favorites && Array.isArray(response.favorites)) {
        console.log("Processing favorites:", response.favorites);

        if (page === 1) {
          setFavorites(response.favorites);
          console.log("Set favorites for page 1:", response.favorites.length);
        } else {
          setFavorites((prev) => {
            const newFavorites = [...prev, ...response.favorites];
            console.log("Added to existing favorites:", newFavorites.length);
            return newFavorites;
          });
        }

        setHasMore(response.pagination.page < response.pagination.totalPages);
        console.log(
          "Has more pages:",
          response.pagination.page < response.pagination.totalPages
        );
      } else {
        console.warn("Invalid response format:", response);
        console.warn("Response exists:", !!response);
        console.warn("Favorites exists:", !!response?.favorites);
        console.warn("Favorites is array:", Array.isArray(response?.favorites));
        setFavorites([]);
        setHasMore(false);
      }
    } catch (error: any) {
      console.error("Failed to fetch favorites:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      // Check if it's a 304 Not Modified response
      if (error.response?.status === 304) {
        console.log("304 Not Modified - using cached data");
        // Don't show error for 304, just use existing data
        return;
      }

      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your favorites
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading && favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">
          {favorites.length} saved{" "}
          {favorites.length === 1 ? "listing" : "listings"}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start browsing cars and save the ones you like!
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Browse Cars
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((listing) => (
              <CarCard
                key={`${listing.id}-${user?.id || "anonymous"}`}
                listing={listing}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} disabled={loading} variant="outline">
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
