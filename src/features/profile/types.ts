export type ProfileNeighborhood = { id: number; name: string; regionCode?: string | null };
export type ProfileInput = { displayName: string; neighborhoodId: number | null };
export type ProfileState = { error?: string; message?: string; displayName?: string; profile?: ProfileInput; neighborhoodId?: number };
export type AccountProfile = {
  user: { id: string; email: string };
  profile: { display_name: string; neighborhood_id: number | null };
  neighborhoods: ProfileNeighborhood[];
  avatarPath: string | null;
};

export type EmailChangeState = { error?: string; message?: string; email?: string };
