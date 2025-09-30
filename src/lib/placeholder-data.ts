
import type { User, SuperAdminUser } from './types';
import { PlaceHolderImages } from './placeholder-images';

// We keep mockUser and mockSuperAdminUser for authentication simulation
// until a proper auth system is in place.
export const mockUser: User = {
    name: "Jane Doe",
    email: "owner@business.com",
    avatarUrl: "https://picsum.photos/seed/useravatar/100/100",
    businessId: "1001"
}

export const mockSuperAdminUser: SuperAdminUser = {
  name: "Super Admin",
  email: "superadmin@reviewrouter.com"
}
