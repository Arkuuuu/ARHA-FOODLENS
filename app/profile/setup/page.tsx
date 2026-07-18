'use strict';

import { OnboardingWizard } from './onboarding-wizard';

export default function ProfileSetupPage() {
  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <OnboardingWizard />
    </div>
  );
}
