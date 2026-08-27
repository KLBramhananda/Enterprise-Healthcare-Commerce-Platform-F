/**
 * AddressSection
 *
 * Checkout section for address selection with add/edit/delete support.
 * Renders address cards in a grid and a modal form for adding/editing.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Modal, EmptyState, Loading } from "@/components/ui";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from "@/hooks/checkout/useAddress";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import type { Address } from "@/types/checkout";
import type { AddressFormData } from "@/hooks/checkout/schemas";

interface AddressSectionProps {
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
}

export default function AddressSection({ selectedAddressId, onSelectAddress }: AddressSectionProps) {
  const { data: addresses, isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAdd = (data: AddressFormData) => {
    addAddress.mutate(data, {
      onSuccess: (newAddr) => {
        setFormOpen(false);
        onSelectAddress(newAddr.id);
      },
    });
  };

  const handleEdit = (data: AddressFormData) => {
    if (!editingAddress) return;
    updateAddress.mutate(
      { id: editingAddress.id, data },
      { onSuccess: () => { setFormOpen(false); setEditingAddress(null); } },
    );
  };

  const handleDelete = (id: string) => {
    deleteAddress.mutate(id);
    if (id === selectedAddressId) onSelectAddress("");
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading message="Loading addresses..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-surface-900">Delivery Address</h2>
        <Button variant="ghost" size="sm" onClick={openAddForm}>
          <Plus size={14} className="mr-1" />
          Add New
        </Button>
      </div>

      {!addresses || addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add a delivery address to continue with your order."
          action={
            <Button size="sm" onClick={openAddForm}>
              <Plus size={14} className="mr-1" />
              Add Address
            </Button>
          }
        />
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.id === selectedAddressId}
              onSelect={onSelectAddress}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSetDefault={(id) => setDefault.mutate(id)}
              showActions
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingAddress(null); }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="xl"
      >
        <AddressForm
          address={editingAddress}
          onSubmit={editingAddress ? handleEdit : handleAdd}
          onCancel={() => { setFormOpen(false); setEditingAddress(null); }}
          isLoading={addAddress.isPending || updateAddress.isPending}
        />
      </Modal>
    </div>
  );
}
