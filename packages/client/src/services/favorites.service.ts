import { apiClient } from "../lib/api";
import type { ListingDetail } from "../types";

export interface FavoritesResponse {
  favorites: ListingDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class FavoritesService {
  static async addToFavorites(listingId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/favorites/${listingId}`);
    return response as { message: string };
  }

  static async removeFromFavorites(
    listingId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.delete(`/favorites/${listingId}`);
    return response as { message: string };
  }

  static async getUserFavorites(
    page: number = 1,
    limit: number = 10
  ): Promise<FavoritesResponse> {
    console.log("FavoritesService.getUserFavorites called with:", {
      page,
      limit,
    });

    const response = await apiClient.get(
      `/favorites?page=${page}&limit=${limit}&_t=${Date.now()}`
    );

    console.log("FavoritesService raw response:", response);
    console.log("FavoritesService response type:", typeof response);
    console.log("FavoritesService response keys:", Object.keys(response || {}));

    // The apiClient.get already returns response.data, so we don't need .data again
    console.log("FavoritesService returning response directly:", response);

    return response as FavoritesResponse;
  }

  static async checkIfFavorite(listingId: string): Promise<boolean> {
    const response = await apiClient.get(
      `/favorites/check/${listingId}?_t=${Date.now()}`
    );
    return response as boolean;
  }
}
