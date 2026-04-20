import { AlertsSection } from "./sections/alerts-section";
import { BadgesSection } from "./sections/badges-section";
import { ButtonsSection } from "./sections/buttons-section";
import { FeedbackSection } from "./sections/feedback-section";
import { InputsFieldsSection } from "./sections/inputs-fields-section";
import { MiscSection } from "./sections/misc-section";
import { NavigationDataSection } from "./sections/navigation-data-section";
import { OverlaysSection } from "./sections/overlays-section";
import { SelectionSection } from "./sections/selection-section";

export function PlaygroundGallery() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 pb-12">
      <ButtonsSection />
      <BadgesSection />
      <AlertsSection />
      <InputsFieldsSection />
      <SelectionSection />
      <FeedbackSection />
      <OverlaysSection />
      <NavigationDataSection />
      <MiscSection />
    </div>
  );
}
