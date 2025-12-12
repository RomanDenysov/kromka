import { SearchIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";

type Props = ComponentProps<"input"> & {
  isLoading?: boolean;
};

export function SearchInput({ isLoading = false, ...props }: Props) {
  return (
    <InputGroup>
      <InputGroupInput {...props} />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        {isLoading && <Spinner className="stroke-[2.5]" />}
      </InputGroupAddon>
    </InputGroup>
  );
}
