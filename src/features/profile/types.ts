export type ProfileInput = { displayName: string; neighborhoodId: number | null };
export type ProfileState = { error?: string; message?: string; profile?: ProfileInput };
export type AccountProfile = {
  user: { id: string; email: string };
  profile: { display_name: string; neighborhood_id: number | null };
  neighborhoods: { id: number; name: string }[];
  avatarPath: string | null;
};
