import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from '../../domain/feature-flags';

export class FeatureFlagService {
  private flags: FeatureFlags;

  constructor(initialFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS) {
    this.flags = { ...initialFlags };
  }

  public isEnabled(flagName: keyof FeatureFlags): boolean {
    return Boolean(this.flags[flagName]);
  }

  public getFlags(): Readonly<FeatureFlags> {
    return { ...this.flags };
  }

  public setFlag(flagName: keyof FeatureFlags, value: boolean): void {
    this.flags[flagName] = value;
  }

  public overrideFlags(partial: Partial<FeatureFlags>): void {
    this.flags = {
      ...this.flags,
      ...partial,
    };
  }
}

export const featureFlagService = new FeatureFlagService();
