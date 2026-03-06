import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/lineamientos-requisitos";

export interface MipgGuidelineRequirementClauseDto {
  guidelineId: string;
  requirementClauseId: string;
  relationType: string;
  coveragePercentage: number;
}

export interface CreateMipgGuidelineRequirementClauseCommand {
  guidelineId: string;
  requirementClauseId: string;
  relationType: string;
  coveragePercentage: number;
}

/** GET /api/v1/qualitas/compliance/lineamientos-requisitos */
export async function getMipgGuidelineRequirements(
  guidelineId?: string,
  requirementClauseId?: string
): Promise<MipgGuidelineRequirementClauseDto[]> {
  try {
    const params: Record<string, string> = {};
    if (guidelineId) params.guidelineId = guidelineId;
    if (requirementClauseId) params.requirementClauseId = requirementClauseId;
    
    const { data } = await api.get<MipgGuidelineRequirementClauseDto[]>(BASE, { params });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching MIPG guideline requirements:", error);
    toast.error("Error al cargar relaciones MIPG-Requisitos");
    return [];
  }
}

/** POST /api/v1/qualitas/compliance/lineamientos-requisitos */
export async function createMipgGuidelineRequirement(
  payload: CreateMipgGuidelineRequirementClauseCommand
): Promise<MipgGuidelineRequirementClauseDto | null> {
  try {
    const { data } = await api.post<MipgGuidelineRequirementClauseDto>(BASE, payload);
    toast.success("Relación creada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating MIPG guideline requirement:", error);
    toast.error("Error al crear relación MIPG-Requisito");
    return null;
  }
}
