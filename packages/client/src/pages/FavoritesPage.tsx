import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import {
  FavoritesService,
  type FavoriteListing,
} from "../services/favorites.service";
import { CarCard } from "../components/CarCard";
import { toast } from "react-hot-toast";
import { Heart, Loader2 } from "lucide-react";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await FavoritesService.getUserFavorites(page, 12);

      if (response && response.favorites && Array.isArray(response.favorites)) {
        if (page === 1) {
          setFavorites(response.favorites);
        } else {
          setFavorites((prev) => [...prev, ...response.favorites]);
        }

        setHasMore(response.pagination.page < response.pagination.totalPages);
      } else {
        setFavorites([]);
        setHasMore(false);
      }
    } catch (error: any) {
      if (error.response?.status === 304) {
        return;
      }
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (listingId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== listingId));
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please log in to view your favorites
          </h2>
          <p className="text-gray-600">
            Sign in to save and manage your favorite car listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Favorites
          </h1>
          <p className="text-gray-600">
            {favorites.length > 0
              ? `You have ${favorites.length} favorite car${favorites.length !== 1 ? "s" : ""}`
              : "No favorite cars yet"}
          </p>
        </div>

        {loading && favorites.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">
              Loading your favorites...
            </span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring cars and add them to your favorites!
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Cars
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((listing) => (
                <CarCard
                  key={listing.id}
                  listing={listing}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
