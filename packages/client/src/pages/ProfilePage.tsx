import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  User,
  Plus,
  Car,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { CarCard } from "../components/CarCard";
import { useAuthStore } from "../store/auth";
import { ProfileService } from "../services/profile.service";
import { ListingService } from "../services/listing.service";
import type { User as UserType, ListingDetail } from "../types";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), {
      message: "Please provide a valid phone number",
    }),
  bio: z.string().optional(),
  location: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userListings, setUserListings] = useState<ListingDetail[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const { updateUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileService.getProfile();
      setUser(response);

      // Populate form with current user data
      setValue("firstName", response.firstName);
      setValue("lastName", response.lastName);
      setValue("email", response.email);
      setValue("phoneNumber", response.phoneNumber || "");
      setValue("bio", response.bio || "");
      setValue("location", response.location || "");
      setValue(
        "dateOfBirth",
        response.dateOfBirth ? response.dateOfBirth.split("T")[0] : ""
      );
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      const response = await ProfileService.updateProfile(data);
      setUser(response);
      updateUser(response);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF)");
      return;
    }

    try {
      setIsUploading(true);
      const response = await ProfileService.uploadAvatar(file);

      const updatedUser = { ...user!, profileImage: response.profileImage };
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUserListings = async () => {
    try {
      setListingsLoading(true);
      const response = (await ListingService.getUserListings()) as {
        listings: ListingDetail[];
      };
      setUserListings(response.listings || []);
    } catch (error) {
      console.error("Failed to fetch user listings:", error);
    } finally {
      setListingsLoading(false);
    }
  };

  const handleEditListing = (id: string) => {
    // Navigate to edit listing page (to be implemented)
    console.log("Edit listing:", id);
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await ListingService.deleteListing(id);
      toast.success("Listing deleted successfully!");
      fetchUserListings(); // Refresh listings
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete listing");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile not found
          </h1>
          <Button onClick={fetchUserProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <Avatar
                  src={
                    user.profileImage
                      ? `http://localhost:3000${user.profileImage}`
                      : undefined
                  }
                  alt="Profile"
                  size="xl"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>

              {user.bio && (
                <p className="text-sm text-gray-700 mb-4 italic">
                  "{user.bio}"
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.location}
                  </div>
                )}
                {user.dateOfBirth && (
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      disabled={!isEditing}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      disabled={!isEditing}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      disabled={!isEditing}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register("phoneNumber")}
                      disabled={!isEditing}
                      placeholder="Optional"
                      className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber.message}
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
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      {...register("location")}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    {...register("bio")}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <div className="mt-8">
            <PasswordChangeForm />
          </div>
        </div>
      </div>

      {/* User Listings */}
      <div className="mt-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Listings</CardTitle>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              asChild
            >
              <a href="/sell-car">
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-4">
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
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => (
                  <CarCard
                    key={listing.id}
                    listing={listing}
                    showActions={true}
                    onEdit={handleEditListing}
                    onDelete={handleDeleteListing}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No listings yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start selling by creating your first car listing
                </p>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  asChild
                >
                  <a href="/sell-car">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
