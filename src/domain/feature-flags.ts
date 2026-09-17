export interface FeatureFlags {
  enableDawStudio: boolean;
  enableScoreEditor: boolean;
  enableVocalPitchTuner: boolean;
  enableCommunityChat: boolean;
  enableTeacherRooms: boolean;
  enableStrictProvenanceAudit: boolean;
  enableMockEnginesInDev: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableDawStudio: false, // Studio starts behind feature flag
  enableScoreEditor: false, // Score studio starts behind feature flag
  enableVocalPitchTuner: true,
  enableCommunityChat: true,
  enableTeacherRooms: true,
  enableStrictProvenanceAudit: true,
  enableMockEnginesInDev: true,
};
