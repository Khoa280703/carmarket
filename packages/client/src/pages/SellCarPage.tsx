import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Car,
  Upload,
  X,
  MapPin,
  DollarSign,
  FileText,
  Camera,
  Plus,
} from "lucide-react";
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

const listingSchema = z.object({
  // Listing Information
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(1, "Price must be greater than 0"),
  priceType: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  // Car Details
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  bodyType: z.string().min(1, "Body type is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  engineSize: z.number().min(0.1, "Engine size must be greater than 0"),
  enginePower: z.number().min(1, "Engine power must be greater than 0"),
  mileage: z.number().min(0, "Mileage cannot be negative"),
  color: z.string().min(1, "Color is required"),
  numberOfDoors: z.number().min(2).max(6).optional(),
  numberOfSeats: z.number().min(2).max(9).optional(),
  condition: z.string().min(1, "Condition is required"),
  vin: z.string().optional(),
  registrationNumber: z.string().optional(),
  previousOwners: z.number().min(0).optional(),
  carDescription: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

export function SellCarPage() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { metadata, loading: metadataLoading } = useMetadata();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      numberOfDoors: 4,
      numberOfSeats: 5,
      priceType: "negotiable",
      country: "USA",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (uploadedImages.length + files.length > 10) {
      toast.error(
        "📸 You can upload maximum 10 images per listing. Please remove some images first."
      );
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          `Image "${file.name}" is too large. Please choose an image smaller than 5MB.`
        );
        return false;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        toast.error(
          `"${file.name}" is not a supported image format. Please use JPEG, PNG, or GIF.`
        );
        return false;
      }
      return true;
    });

    setUploadedImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const onSubmit = async (data: ListingForm) => {
    try {
      setIsUploading(true);

      // Upload images first if any
      let imageUrls: Array<{
        filename: string;
        url: string;
        originalName: string;
        fileSize: number;
        mimeType: string;
      }> = [];
      if (uploadedImages.length > 0) {
        const uploadResponse =
          await ListingService.uploadCarImages(uploadedImages);
        imageUrls = uploadResponse.images;
      }

      // Prepare listing data
      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        location: data.location,
        city: data.city,
        state: data.state,
        country: data.country,
        carDetail: {
          make: data.make,
          model: data.model,
          year: data.year,
          bodyType: data.bodyType,
          fuelType: data.fuelType,
          transmission: data.transmission,
          engineSize: data.engineSize,
          enginePower: data.enginePower,
          mileage: data.mileage,
          color: data.color,
          numberOfDoors: data.numberOfDoors || 4,
          numberOfSeats: data.numberOfSeats || 5,
          condition: data.condition,
          vin: data.vin,
          registrationNumber: data.registrationNumber,
          previousOwners: data.previousOwners,
          description: data.carDescription,
          features: selectedFeatures,
        },
        images: imageUrls.map((img, index) => ({
          filename: img.filename,
          originalName: img.originalName,
          url: img.url,
          type: index === 0 ? "exterior" : "other",
          alt: `${data.make} ${data.model} image ${index + 1}`,
          fileSize: img.fileSize,
          mimeType: img.mimeType,
        })),
      };

      const newListing = await ListingService.createListing(listingData);

      toast.success(
        "🎉 Your car listing has been created successfully! Our team will review it within 24 hours."
      );
      navigate(`/cars/${newListing.id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "We couldn't create your listing right now. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (metadataLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load form data
          </h1>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Car</h1>
        <p className="text-gray-600">
          Create a detailed listing to attract potential buyers
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
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
                placeholder="e.g., 2020 Toyota Camry LE - Low Mileage, Excellent Condition"
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
                placeholder="Provide detailed information about your car's condition, maintenance history, and any special features..."
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
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="25000"
                    className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="priceType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price Type
                </label>
                <select
                  id="priceType"
                  {...register("priceType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {metadata.priceTypes.map((type) => (
                    <option key={type.id} value={type.value}>
                      {type.displayValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="New York, NY"
                    className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <Input id="city" {...register("city")} placeholder="New York" />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <Input id="state" {...register("state")} placeholder="NY" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Car Details
            </CardTitle>
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
                  placeholder="Toyota"
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
                  placeholder="Camry"
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
                  placeholder="2020"
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
                  htmlFor="bodyType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Body Type
                </label>
                <select
                  id="bodyType"
                  {...register("bodyType")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bodyType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select body type</option>
                  {metadata.bodyTypes.map((type) => (
                    <option key={type.id} value={type.value}>
                      {type.displayValue}
                    </option>
                  ))}
                </select>
                {errors.bodyType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bodyType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fuelType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  {...register("fuelType")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fuelType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select fuel type</option>
                  {metadata.fuelTypes.map((type) => (
                    <option key={type.id} value={type.value}>
                      {type.displayValue}
                    </option>
                  ))}
                </select>
                {errors.fuelType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fuelType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="transmission"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Transmission
                </label>
                <select
                  id="transmission"
                  {...register("transmission")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.transmission ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select transmission</option>
                  {metadata.transmissionTypes.map((type) => (
                    <option key={type.id} value={type.value}>
                      {type.displayValue}
                    </option>
                  ))}
                </select>
                {errors.transmission && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.transmission.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="engineSize"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Engine Size (L)
                </label>
                <Input
                  id="engineSize"
                  type="number"
                  step="0.1"
                  {...register("engineSize", { valueAsNumber: true })}
                  placeholder="2.4"
                  className={errors.engineSize ? "border-red-500" : ""}
                />
                {errors.engineSize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.engineSize.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="enginePower"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Engine Power (HP)
                </label>
                <Input
                  id="enginePower"
                  type="number"
                  {...register("enginePower", { valueAsNumber: true })}
                  placeholder="200"
                  className={errors.enginePower ? "border-red-500" : ""}
                />
                {errors.enginePower && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.enginePower.message}
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
                  placeholder="50000"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {metadata.conditions.map((type) => (
                    <option key={type.id} value={type.value}>
                      {type.displayValue}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.condition.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="numberOfDoors"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Doors
                </label>
                <Input
                  id="numberOfDoors"
                  type="number"
                  min="2"
                  max="6"
                  {...register("numberOfDoors", { valueAsNumber: true })}
                  placeholder="4"
                />
              </div>

              <div>
                <label
                  htmlFor="numberOfSeats"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Seats
                </label>
                <Input
                  id="numberOfSeats"
                  type="number"
                  min="2"
                  max="9"
                  {...register("numberOfSeats", { valueAsNumber: true })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="vin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  VIN (Optional)
                </label>
                <Input
                  id="vin"
                  {...register("vin")}
                  placeholder="1HGBH41JXMN109186"
                />
              </div>

              <div>
                <label
                  htmlFor="registrationNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Registration Number
                </label>
                <Input
                  id="registrationNumber"
                  {...register("registrationNumber")}
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label
                  htmlFor="previousOwners"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Previous Owners
                </label>
                <Input
                  id="previousOwners"
                  type="number"
                  min="0"
                  {...register("previousOwners", { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Car Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each (Max 10 images)
                  </p>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Car image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Car Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Features & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {metadata.carFeatures.map((feature) => (
                <label
                  key={feature.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFeatures.includes(feature.value)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature.value)}
                    onChange={() => toggleFeature(feature.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{feature.displayValue}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting || isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Listing...
              </>
            ) : (
              <>
                <Car className="w-4 h-4 mr-2" />
                Create Listing
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
