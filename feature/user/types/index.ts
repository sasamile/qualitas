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
}

