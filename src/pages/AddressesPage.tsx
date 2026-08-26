import { useState, useMemo } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import { Container, Button, Modal, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/checkout/useAddress";
import { AddressCard, AddressForm } from "@/components/checkout";
import type { Address } from "@/types/checkout";
import type { AddressFormData } from "@/hooks/checkout/schemas";

type LabelFilter = "all" | "home" | "work" | "other";

const LABEL_TABS: { value: LabelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

export default function AddressesPage() {
  usePageTitle("My Addresses");
  const { data: addresses, isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabel, setActiveLabel] = useState<LabelFilter>("all");

  const filteredAddresses = useMemo(() => {
    if (!addresses) return [];
    return addresses.filter((addr) => {
      const matchesLabel =
        activeLabel === "all" ||
        (activeLabel === "home" && addr.label.toLowerCase().includes("home")) ||
        (activeLabel === "work" && addr.label.toLowerCase().includes("work")) ||
        (activeLabel === "other" &&
          !addr.label.toLowerCase().includes("home") &&
          !addr.label.toLowerCase().includes("work"));
      if (!matchesLabel) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        addr.label.toLowerCase().includes(q) ||
        addr.city.toLowerCase().includes(q) ||
        addr.fullName.toLowerCase().includes(q)
      );
    });
  }, [addresses, searchQuery, activeLabel]);

  const handleAdd = (data: AddressFormData) => {
    addAddress.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleEdit = (data: AddressFormData) => {
    if (!editingAddress) return;
    updateAddress.mutate(
      { id: editingAddress.id, data },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingAddress(null);
        },
      },
    );
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Addresses" },
          ]}
        />

        <header className="mt-4 flex items-center justify-between border-b border-surface-200 pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              My Addresses
            </h1>
            {addresses && addresses.length > 0 && (
              <p className="mt-1 text-sm text-surface-500">
                {addresses.length} address{addresses.length !== 1 && "es"} saved
              </p>
            )}
          </div>
          <Button size="sm" onClick={openAddForm}>
            <Plus size={14} className="mr-1" />
            Add New
          </Button>
        </header>

        {addresses && addresses.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
              />
              <input
                type="text"
                placeholder="Search by name, city, or label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-surface-300 bg-surface-0 py-2 pl-9 pr-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-surface-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {LABEL_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveLabel(tab.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeLabel === tab.value
                      ? "bg-surface-900 text-surface-0"
                      : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl bg-surface-100"
                />
              ))}
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <EmptyState
              title="No saved addresses"
              description="Add a delivery address to get started."
              action={
                <Button onClick={openAddForm}>
                  <MapPin size={14} className="mr-1" />
                  Add Address
                </Button>
              }
            />
          ) : filteredAddresses.length === 0 ? (
            <EmptyState
              title="No addresses found"
              description="Try adjusting your search or filter."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAddresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onSelect={undefined}
                  onEdit={openEditForm}
                  onDelete={(id) => deleteAddress.mutate(id)}
                  onSetDefault={(id) => setDefault.mutate(id)}
                  showActions
                />
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingAddress(null);
          }}
          title={editingAddress ? "Edit Address" : "Add New Address"}
        >
          <AddressForm
            address={editingAddress}
            onSubmit={editingAddress ? handleEdit : handleAdd}
            onCancel={() => {
              setFormOpen(false);
              setEditingAddress(null);
            }}
            isLoading={addAddress.isPending || updateAddress.isPending}
          />
        </Modal>
      </Container>
    </div>
  );
}
