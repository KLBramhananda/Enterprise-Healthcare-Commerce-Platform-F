/**
 * User Mapper
 *
 * Maps between ERPNext User DocType (snake_case) and frontend User model.
 *
 * ERPNext shape (expected):
 *   { name, full_name, email, phone, is_verified, creation, ... }
 *
 * Frontend shape:
 *   { id, fullName, email, phone, isVerified, createdAt, ... }
 */

import type { User } from "@/types/auth";
import type { Mapper } from "./types";

/** ERPNext User document shape (snake_case Frappe convention). */
export interface ErpNextUserDto {
  name: string;
  full_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  creation: string;
}

export const userMapper: Mapper<ErpNextUserDto, User> = {
  toDomain(dto) {
    return {
      id: dto.name,
      fullName: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      isVerified: dto.is_verified,
      createdAt: dto.creation,
    };
  },

  toDto(domain) {
    return {
      name: domain.id,
      full_name: domain.fullName,
      email: domain.email,
      phone: domain.phone,
      is_verified: domain.isVerified,
      creation: domain.createdAt,
    };
  },
};
