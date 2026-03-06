export interface UserDto {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  imageUrl: string | null;
  // IDs organizacionales (ver doc OBTENER_DATOS_USUARIO_CARGO_AREA_ORGANIZACION)
  organizationId?: string;
  organizationUnitId?: string;
  positionId?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserSearchParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
  roleId?: string;
  // Filtro adicional solo para frontend (no se envía al backend)
  organizationUnitId?: string;
}

export interface PositionDto {
  id: string;
  name: string;
  isActive: boolean;
}

export interface OrganizationUnitDto {
  id: string;
  name: string;
  isActive: boolean;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  permissions?: string[] | null;
}

export interface UserWithOrg extends UserDto {
  positionName?: string | null;
  organizationUnitName?: string | null;
  roleName?: string | null;
   lastAccessAt?: string | null;
}

export interface UserRoleDto {
  roleId: string;
  roleName: string;
  description?: string;
  enabled: boolean;
}

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export interface UpdateUserAdminPayload {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  deleteCurrentImage?: boolean;
  organizationId?: string | null;
  organizationUnitId?: string | null;
  positionId?: string | null;
  phoneNumberSecondary?: string | null;
  startDate?: string | null;
}

export interface UserSessionDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isActive: boolean;
  isCurrentSession: boolean;
}

export interface GroupDto {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isSystemGroup: boolean;
  memberCount: number;
  roleIds: string[];
  roleNames: string[];
  createdAt: string;
}

