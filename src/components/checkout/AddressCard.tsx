/**
 * AddressCard
 *
 * Displays a saved address with radio selection, edit/delete actions,
 * and default badge. Used in checkout and addresses page.
 */

import { MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { Address } from "@/types/checkout";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  showActions?: boolean;
}

export default function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}: AddressCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-fast ease-smooth",
        selected
          ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
          : "border-surface-200 hover:border-surface-300",
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="radio"
            name="address"
            checked={selected}
            onChange={() => onSelect(address.id)}
            className="mt-1 h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-brand-600" />
            <span className="text-sm font-semibold text-surface-900">{address.label}</span>
            {address.isDefault && (
              <Badge variant="success">
                <Star size={10} className="mr-0.5" />
                Default
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-surface-700">{address.fullName} &middot; {address.phone}</p>
          <p className="mt-0.5 text-sm text-surface-500">
            {address.line1}
            {address.line2 && `, ${address.line2}`}
          </p>
          <p className="text-sm text-surface-500">
            {address.city}, {address.state} {address.pincode}
          </p>
          <p className="text-xs text-surface-400">{address.country}</p>
        </div>
      </div>

      {showActions && (
        <div className="mt-3 flex items-center gap-2 border-t border-surface-100 pt-3">
          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address.id)}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Set as Default
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(address)}
              className="flex items-center gap-1 text-xs font-medium text-surface-500 hover:text-surface-700"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(address.id)}
              className="flex items-center gap-1 text-xs font-medium text-danger-600 hover:text-danger-700"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
