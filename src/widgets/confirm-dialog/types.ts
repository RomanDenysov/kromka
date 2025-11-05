type ConfirmOptions = {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive";
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

export type { ConfirmOptions, ConfirmFn };
