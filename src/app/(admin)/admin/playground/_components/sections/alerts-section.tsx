"use client";

import { AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaygroundSection } from "../playground-section";

export function AlertsSection() {
  return (
    <PlaygroundSection
      description="Upozornenia s ikonou a bez."
      id="alerts"
      title="Alert"
    >
      <div className="flex flex-col gap-4">
        <Alert>
          <InfoIcon />
          <AlertTitle>Predvolený</AlertTitle>
          <AlertDescription>Krátky popis stavu alebo akcie.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Chyba</AlertTitle>
          <AlertDescription>Nepodarilo sa uložiť zmeny.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle2Icon />
          <AlertTitle>Úspech</AlertTitle>
          <AlertDescription>Objednávka bola odoslaná.</AlertDescription>
        </Alert>
      </div>
    </PlaygroundSection>
  );
}
