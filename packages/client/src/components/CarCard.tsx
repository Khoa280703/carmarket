import { Link } from "react-router-dom";
import { Car, MapPin, Calendar, Fuel, Eye, Heart } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { formatPrice, formatNumber, formatRelativeTime } from "../lib/utils";
import type { ListingDetail } from "../types";

interface CarCardProps {
  listing: ListingDetail;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CarCard({
  listing,
  showActions = false,
  onEdit,
  onDelete,
}: CarCardProps) {
  const primaryImage =
    listing.carDetail.images.find((img) => img.isPrimary) ||
    listing.carDetail.images[0];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <Link to={`/cars/${listing.id}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {primaryImage ? (
            <img
              src={`http://localhost:3000${primaryImage.url}`}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {listing.isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            {listing.isUrgent && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Urgent
              </span>
            )}
            {listing.status === "pending" && (
              <span className="bg-orange-400 text-orange-900 px-2 py-1 rounded text-xs font-medium">
                Pending Review
              </span>
            )}
          </div>

          {/* View Count */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {formatNumber(listing.viewCount)}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/cars/${listing.id}`}>
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>

          {/* Car Info */}
          <div className="text-sm text-gray-600 mb-3 space-y-1">
            <div className="flex items-center">
              <Car className="w-4 h-4 mr-2" />
              {listing.carDetail.year} •{" "}
              {formatNumber(listing.carDetail.mileage)} miles
            </div>
            <div className="flex items-center">
              <Fuel className="w-4 h-4 mr-2" />
              {listing.carDetail.fuelType.charAt(0).toUpperCase() +
                listing.carDetail.fuelType.slice(1)}{" "}
              •{" "}
              {listing.carDetail.transmission.charAt(0).toUpperCase() +
                listing.carDetail.transmission.slice(1)}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {listing.location}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(listing.price)}
            </div>
            {listing.priceType !== "fixed" && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {listing.priceType.charAt(0).toUpperCase() +
                  listing.priceType.slice(1)}
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatRelativeTime(listing.createdAt)}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {listing.favoriteCount}
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {listing.viewCount}
              </div>
            </div>
          </div>
        </Link>

        {/* Action Buttons for User's Own Listings */}
        {showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onEdit?.(listing.id);
              }}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onDelete?.(listing.id);
              }}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
