/**
 * AddressesPage
 *
 * Standalone address management page with add, edit, delete,
 * and default selection. Reuses checkout components.
 */

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Container, Button, Modal, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from "@/hooks/checkout/useAddress";
import { AddressCard } from "@/components/checkout";
import { AddressForm } from "@/components/checkout";
import type { Address } from "@/types/checkout";
import type { AddressFormData } from "@/hooks/checkout/schemas";

export default function AddressesPage() {
  usePageTitle("My Addresses");
  const { data: addresses, isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAdd = (data: AddressFormData) => {
    addAddress.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleEdit = (data: AddressFormData) => {
    if (!editingAddress) return;
    updateAddress.mutate(
      { id: editingAddress.id, data },
      { onSuccess: () => { setFormOpen(false); setEditingAddress(null); } },
    );
  };

  const openAddForm = () => { setEditingAddress(null); setFormOpen(true); };
  const openEditForm = (address: Address) => { setEditingAddress(address); setFormOpen(true); };

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
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            My Addresses
          </h1>
          <Button size="sm" onClick={openAddForm}>
            <Plus size={14} className="mr-1" />
            Add New
          </Button>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-100" />
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
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
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
          onClose={() => { setFormOpen(false); setEditingAddress(null); }}
          title={editingAddress ? "Edit Address" : "Add New Address"}
        >
          <AddressForm
            address={editingAddress}
            onSubmit={editingAddress ? handleEdit : handleAdd}
            onCancel={() => { setFormOpen(false); setEditingAddress(null); }}
            isLoading={addAddress.isPending || updateAddress.isPending}
          />
        </Modal>
      </Container>
    </div>
  );
}
