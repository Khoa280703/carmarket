import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { ListingService } from "../services/listing.service";
import { useMetadata } from "../services/metadata.service";
import type { ListingDetail } from "../types";

const editListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(1, "Price must be greater than 0"),
  priceType: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  mileage: z.number().min(0, "Mileage cannot be negative"),
  condition: z.string().min(1, "Condition is required"),
});

type EditListingForm = z.infer<typeof editListingSchema>;

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { metadata, loading: metadataLoading } = useMetadata();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
  });

  useEffect(() => {
    if (id) {
      fetchListing(id);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    try {
      setLoading(true);
      const response = await ListingService.getListing(listingId);
      setListing(response);

      // Populate form
      setValue("title", response.title);
      setValue("description", response.description);
      setValue("price", response.price);
      setValue("priceType", response.priceType);
      setValue("location", response.location);
      setValue("make", response.carDetail.make);
      setValue("model", response.carDetail.model);
      setValue("year", response.carDetail.year);
      setValue("color", response.carDetail.color);
      setValue("mileage", response.carDetail.mileage);
      setValue("condition", response.carDetail.condition);
    } catch (error) {
      toast.error("Failed to load listing details");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditListingForm) => {
    if (!listing || !id) return;

    try {
      const updateData = {
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        location: data.location,
        carDetail: {
          make: data.make,
          model: data.model,
          year: data.year,
          color: data.color,
          mileage: data.mileage,
          condition: data.condition,
          // Keep existing values for required fields not in edit form
          bodyType: listing.carDetail.bodyType,
          fuelType: listing.carDetail.fuelType,
          transmission: listing.carDetail.transmission,
          engineSize: listing.carDetail.engineSize,
          enginePower: listing.carDetail.enginePower,
        },
      };

      await ListingService.updateListing(id, updateData);
      toast.success(
        "✅ Your listing has been updated successfully! It will be reviewed again by our team."
      );
      navigate("/profile");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "We couldn't update your listing. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (loading || metadataLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing || !metadata) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Listing not found
          </h1>
          <Button onClick={() => navigate("/profile")}>Back to Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
        <p className="text-gray-600">
          Update your listing details. Changes will require admin re-approval.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Listing Title
              </label>
              <Input
                id="title"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price ($)
                </label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <Input
                  id="location"
                  {...register("location")}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Details */}
        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="make"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Make
                </label>
                <Input
                  id="make"
                  {...register("make")}
                  className={errors.make ? "border-red-500" : ""}
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.make.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Model
                </label>
                <Input
                  id="model"
                  {...register("model")}
                  className={errors.model ? "border-red-500" : ""}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.model.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <Input
                  id="year"
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                  className={errors.year ? "border-red-500" : ""}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color
                </label>
                <select
                  id="color"
                  {...register("color")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.color ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select color</option>
                  {metadata.colors.map((color) => (
                    <option key={color.id} value={color.value}>
                      {color.displayValue}
                    </option>
                  ))}
                </select>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.color.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mileage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mileage (miles)
                </label>
                <Input
                  id="mileage"
                  type="number"
                  {...register("mileage", { valueAsNumber: true })}
                  className={errors.mileage ? "border-red-500" : ""}
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mileage.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="condition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  {...register("condition")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.condition ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select condition</option>
                  {metadata.conditions.map((condition) => (
                    <option key={condition.id} value={condition.value}>
                      {condition.displayValue}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.condition.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Listing
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
