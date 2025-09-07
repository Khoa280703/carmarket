import { useState, useEffect } from "react";
import {
  Users,
  Car,
  Database,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { AdminService } from "../services/admin.service";
import type { DashboardStats, AdminMetadata } from "../services/admin.service";
import type { CarMetadata } from "../services/metadata.service";
import toast from "react-hot-toast";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "makes" | "metadata">(
    "overview"
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminMetadata, setAdminMetadata] = useState<AdminMetadata | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemForm, setNewItemForm] = useState<{
    type?: string;
    visible: boolean;
  }>({ visible: false });

  useEffect(() => {
    fetchDashboardStats();
    fetchAdminMetadata();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await AdminService.getDashboardStats();
      setStats(response);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    }
  };

  const fetchAdminMetadata = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllMetadataForAdmin();
      setAdminMetadata(response);
    } catch (error) {
      toast.error("Failed to load metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      await AdminService.seedInitialData();
      toast.success("Initial data seeded successfully!");
      fetchAdminMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to seed data");
    }
  };

  const handleCreateMake = async (data: {
    name: string;
    displayName: string;
  }) => {
    try {
      await AdminService.createMake(data);
      toast.success("Car make created successfully!");
      fetchAdminMetadata();
      setNewItemForm({ visible: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create car make");
    }
  };

  const handleUpdateMake = async (id: string, data: any) => {
    try {
      await AdminService.updateMake(id, data);
      toast.success("Car make updated successfully!");
      fetchAdminMetadata();
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update car make");
    }
  };

  const handleDeleteMake = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this car make?"))
      return;

    try {
      await AdminService.deleteMake(id);
      toast.success("Car make deleted successfully!");
      fetchAdminMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete car make");
    }
  };

  const handleCreateMetadata = async (data: {
    type: string;
    value: string;
    displayValue: string;
  }) => {
    try {
      await AdminService.createMetadata(data);
      toast.success("Metadata created successfully!");
      fetchAdminMetadata();
      setNewItemForm({ visible: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create metadata");
    }
  };

  const handleUpdateMetadata = async (id: string, data: any) => {
    try {
      await AdminService.updateMetadata(id, data);
      toast.success("Metadata updated successfully!");
      fetchAdminMetadata();
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update metadata");
    }
  };

  const handleDeleteMetadata = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this metadata?"))
      return;

    try {
      await AdminService.deleteMetadata(id);
      toast.success("Metadata deleted successfully!");
      fetchAdminMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete metadata");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage your car marketplace platform</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Listings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalListings}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingListings}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "makes", label: "Car Makes", icon: Car },
            { id: "metadata", label: "Metadata", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleSeedData}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Seed Initial Data
                </Button>
                <Button onClick={() => setActiveTab("makes")} variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Manage Car Makes
                </Button>
                <Button
                  onClick={() => setActiveTab("metadata")}
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Metadata
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Car Makes Management */}
      {activeTab === "makes" && adminMetadata && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Car Makes Management
            </h2>
            <Button
              onClick={() => setNewItemForm({ type: "make", visible: true })}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Make
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminMetadata.makes.map((make) => (
                      <tr key={make.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {make.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {make.displayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              make.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {make.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingItem({ ...make, type: "make" })
                            }
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMake(make.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metadata Management */}
      {activeTab === "metadata" && adminMetadata && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Metadata Management
            </h2>
            <Button
              onClick={() =>
                setNewItemForm({ type: "metadata", visible: true })
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Metadata
            </Button>
          </div>

          {/* Group metadata by type */}
          {Object.entries(
            adminMetadata.metadata.reduce(
              (acc, item) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
              },
              {} as Record<string, CarMetadata[]>
            )
          ).map(([type, items]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {type.replace("_", " ")} ({items.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.displayValue}
                          </p>
                          <p className="text-sm text-gray-500">{item.value}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingItem({ ...item, type: "metadata" })
                          }
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMetadata(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit {editingItem.type === "make" ? "Car Make" : "Metadata"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(formData.entries());

                if (editingItem.type === "make") {
                  handleUpdateMake(editingItem.id, data);
                } else {
                  handleUpdateMetadata(editingItem.id, data);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <Input
                  name="displayName"
                  defaultValue={editingItem.displayName}
                  required
                />
              </div>

              {editingItem.type === "metadata" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <Input
                    name="value"
                    defaultValue={editingItem.value}
                    required
                  />
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingItem.isActive}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {newItemForm.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New {newItemForm.type === "make" ? "Car Make" : "Metadata"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(formData.entries());

                if (newItemForm.type === "make") {
                  handleCreateMake(data as any);
                } else {
                  handleCreateMetadata(data as any);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input name="name" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <Input name="displayName" required />
              </div>

              {newItemForm.type === "metadata" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="fuel_type">Fuel Type</option>
                      <option value="transmission_type">
                        Transmission Type
                      </option>
                      <option value="body_type">Body Type</option>
                      <option value="condition">Condition</option>
                      <option value="price_type">Price Type</option>
                      <option value="car_feature">Car Feature</option>
                      <option value="color">Color</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    <Input
                      name="value"
                      required
                      placeholder="lowercase_value"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewItemForm({ visible: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
