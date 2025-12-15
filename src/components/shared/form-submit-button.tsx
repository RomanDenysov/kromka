import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Spinner } from "../ui/spinner";

export function FormSubmitButton({ formId }: { formId: string }) {
  const status = useFormStatus();
  return (
    <Button disabled={status.pending} form={formId} size="sm" type="submit">
      Uložiť {status.pending ? <Spinner /> : <Kbd>Enter</Kbd>}
    </Button>
  );
}
