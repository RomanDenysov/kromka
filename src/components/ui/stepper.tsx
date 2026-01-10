/** biome-ignore-all lint/style/noNestedTernary: Ignore this for now */
"use client";

import { Slot } from "@radix-ui/react-slot";
import { Check } from "lucide-react";
import {
  type ComponentProps,
  type ComponentRef,
  createContext,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Stepper";
const LIST_NAME = "StepperList";
const ITEM_NAME = "StepperItem";
const TRIGGER_NAME = "StepperTrigger";
const INDICATOR_NAME = "StepperIndicator";
const SEPARATOR_NAME = "StepperSeparator";
const TITLE_NAME = "StepperTitle";
const DESCRIPTION_NAME = "StepperDescription";
const CONTENT_NAME = "StepperContent";
const PREV_TRIGGER_NAME = "StepperPrevTrigger";
const NEXT_TRIGGER_NAME = "StepperNextTrigger";

const ENTRY_FOCUS = "stepperFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function getId(
  id: string,
  variant: "trigger" | "content" | "title" | "description",
  value: string
) {
  return `${id}-${variant}-${value}`;
}

type FocusIntent = "first" | "last" | "prev" | "next";

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
};

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== "rtl") {
    return key;
  }
  return key === "ArrowLeft"
    ? "ArrowRight"
    : key === "ArrowRight"
      ? "ArrowLeft"
      : key;
}

type TriggerElement = ComponentRef<typeof StepperTrigger>;

function getFocusIntent(
  event: KeyboardEvent<TriggerElement>,
  dir?: Direction,
  orientation?: Orientation
) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) {
    return;
  }
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) {
    return;
  }
  return MAP_KEY_TO_FOCUS_INTENT[key];
}

function focusFirst(
  candidates: RefObject<TriggerElement | null>[],
  preventScroll = false
) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) {
      continue;
    }
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) {
      return;
    }
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) {
      return;
    }
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T
  );
}

function useLazyRef<T>(fn: () => T) {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type NavigationDirection = "next" | "prev";
type ActivationMode = "automatic" | "manual";
type DataState = "inactive" | "active" | "completed";

interface DivProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

// biome-ignore lint/nursery/useMaxParams: Ignore this for now
function getDataState(
  value: string | undefined,
  itemValue: string,
  stepState: StepState | undefined,
  steps: Map<string, StepState>,
  variant: "item" | "separator" = "item"
): DataState {
  const stepKeys = Array.from(steps.keys());
  const currentIndex = stepKeys.indexOf(itemValue);

  if (stepState?.completed) {
    return "completed";
  }

  if (value === itemValue) {
    return variant === "separator" ? "inactive" : "active";
  }

  if (value) {
    const activeIndex = stepKeys.indexOf(value);

    if (activeIndex > currentIndex) {
      return "completed";
    }
  }

  return "inactive";
}

const DirectionContext = createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

type StepState = {
  value: string;
  completed: boolean;
  disabled: boolean;
};

type StoreState = {
  steps: Map<string, StepState>;
  value?: string;
};

// biome-ignore lint/style/useConsistentTypeDefinitions: Ignore this for now
interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  setStateWithValidation: (
    value: string,
    direction: NavigationDirection
  ) => Promise<boolean>;
  hasValidation: () => boolean;
  notify: () => void;
  addStep: (value: string, completed: boolean, disabled: boolean) => void;
  removeStep: (value: string) => void;
  setStep: (value: string, completed: boolean, disabled: boolean) => void;
}

// biome-ignore lint/nursery/useMaxParams: Ignore this for now
function createStore(
  listenersRef: RefObject<Set<() => void>>,
  stateRef: RefObject<StoreState>,
  onValueChange?: (value: string) => void,
  onValueComplete?: (value: string, completed: boolean) => void,
  onValueAdd?: (value: string) => void,
  onValueRemove?: (value: string) => void,
  onValidate?: (
    value: string,
    direction: NavigationDirection
  ) => boolean | Promise<boolean>
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      // biome-ignore lint/suspicious/noEmptyBlockStatements: Ignore this for now
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        steps: new Map(),
        value: undefined,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) {
        return;
      }

      if (key === "value" && typeof value === "string") {
        state.value = value;
        onValueChange?.(value);
      } else {
        state[key] = value;
      }

      store.notify();
    },
    setStateWithValidation: async (value, direction) => {
      if (!onValidate) {
        store.setState("value", value);
        return true;
      }

      try {
        const isValid = await onValidate(value, direction);
        if (isValid) {
          store.setState("value", value);
        }
        return isValid;
      } catch {
        return false;
      }
    },
    hasValidation: () => !!onValidate,
    addStep: (value, completed, disabled) => {
      const state = stateRef.current;
      if (state) {
        const newStep: StepState = { value, completed, disabled };
        state.steps.set(value, newStep);
        onValueAdd?.(value);
        store.notify();
      }
    },
    removeStep: (value) => {
      const state = stateRef.current;
      if (state) {
        state.steps.delete(value);
        onValueRemove?.(value);
        store.notify();
      }
    },
    setStep: (value, completed, disabled) => {
      const state = stateRef.current;
      if (state) {
        const step = state.steps.get(value);
        if (step) {
          const updatedStep: StepState = { ...step, completed, disabled };
          state.steps.set(value, updatedStep);

          if (completed !== step.completed) {
            onValueComplete?.(value, completed);
          }

          store.notify();
        }
      }
    },
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
  };

  return store;
}

const StoreContext = createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = useCallback(
    () => selector(store.getState()),
    [store, selector]
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

type ItemData = {
  id: string;
  ref: RefObject<TriggerElement | null>;
  value: string;
  active: boolean;
  disabled: boolean;
};

type StepperContextValue = {
  id: string;
  dir: Direction;
  orientation: Orientation;
  activationMode: ActivationMode;
  disabled: boolean;
  nonInteractive: boolean;
  loop: boolean;
};

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(consumerName: string) {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface StepperRootProps extends DivProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValueComplete?: (value: string, completed: boolean) => void;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
  onValidate?: (
    value: string,
    direction: NavigationDirection
  ) => boolean | Promise<boolean>;
  activationMode?: ActivationMode;
  dir?: Direction;
  orientation?: Orientation;
  disabled?: boolean;
  loop?: boolean;
  nonInteractive?: boolean;
}

function StepperRoot(props: StepperRootProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueAdd,
    onValueRemove,
    onValidate,
    id: idProp,
    dir: dirProp,
    orientation = "horizontal",
    activationMode = "automatic",
    asChild,
    disabled = false,
    nonInteractive = false,
    loop = false,
    className,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    steps: new Map(),
    value: value ?? defaultValue,
  }));

  const store = useMemo(
    () =>
      createStore(
        listenersRef,
        stateRef,
        onValueChange,
        onValueComplete,
        onValueAdd,
        onValueRemove,
        onValidate
      ),
    [
      listenersRef,
      stateRef,
      onValueChange,
      onValueComplete,
      onValueAdd,
      onValueRemove,
      onValidate,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value]);

  const dir = useDirection(dirProp);

  const id = useId();

  const rootId = idProp ?? id;

  const contextValue = useMemo<StepperContextValue>(
    () => ({
      id: rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      nonInteractive,
      loop,
    }),
    [rootId, dir, orientation, activationMode, disabled, nonInteractive, loop]
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <StepperContext.Provider value={contextValue}>
        <RootPrimitive
          data-disabled={disabled ? "" : undefined}
          data-orientation={orientation}
          data-slot="stepper"
          dir={dir}
          id={rootId}
          {...rootProps}
          className={cn(
            "flex gap-6",
            orientation === "horizontal" ? "w-full flex-col" : "flex-row",
            className
          )}
        />
      </StepperContext.Provider>
    </StoreContext.Provider>
  );
}

type FocusContextValue = {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => ItemData[];
};

const FocusContext = createContext<FocusContextValue | null>(null);

function useFocusContext(consumerName: string) {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`FocusProvider\``
    );
  }
  return context;
}

type ListElement = ComponentRef<typeof StepperList>;

interface StepperListProps extends DivProps {
  asChild?: boolean;
}

function StepperList(props: StepperListProps) {
  const { className, children, asChild, ref, ...listProps } = props;

  const context = useStepperContext(LIST_NAME);
  const orientation = context.orientation;
  const currentValue = useStore((state) => state.value);

  const [tabStopId, setTabStopId] = useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = useState(false);
  const [focusableItemCount, setFocusableItemCount] = useState(0);
  const isClickFocusRef = useRef(false);
  const itemsRef = useRef<Map<string, ItemData>>(new Map());
  const listRef = useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(ref, listRef);

  const onItemFocus = useCallback((_tabStopId: string) => {
    setTabStopId(_tabStopId);
  }, []);

  const onItemShiftTab = useCallback(() => {
    setIsTabbingBackOut(true);
  }, []);

  const onFocusableItemAdd = useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount + 1);
  }, []);

  const onFocusableItemRemove = useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount - 1);
  }, []);

  const onItemRegister = useCallback((item: ItemData) => {
    itemsRef.current.set(item.id, item);
  }, []);

  const onItemUnregister = useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = useCallback(
    () =>
      Array.from(itemsRef.current.values())
        .filter((item) => item.ref.current)
        .sort((a, b) => {
          const elementA = a.ref.current;
          const elementB = b.ref.current;
          if (!(elementA && elementB)) {
            return 0;
          }
          const position = elementA.compareDocumentPosition(elementB);
          // biome-ignore lint/suspicious/noBitwiseOperators: Ignore this for now
          if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
          }
          // biome-ignore lint/suspicious/noBitwiseOperators: Ignore this for now
          if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
          }
          return 0;
        }),
    []
  );

  const onBlur = useCallback(
    (event: FocusEvent<ListElement>) => {
      listProps.onBlur?.(event);
      if (event.defaultPrevented) {
        return;
      }

      setIsTabbingBackOut(false);
    },
    [listProps.onBlur]
  );

  const onFocus = useCallback(
    (event: FocusEvent<ListElement>) => {
      listProps.onFocus?.(event);
      if (event.defaultPrevented) {
        return;
      }

      const isKeyboardFocus = !isClickFocusRef.current;
      if (
        event.target === event.currentTarget &&
        isKeyboardFocus &&
        !isTabbingBackOut
      ) {
        const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
        event.currentTarget.dispatchEvent(entryFocusEvent);

        if (!entryFocusEvent.defaultPrevented) {
          const items = Array.from(itemsRef.current.values()).filter(
            (item) => !item.disabled
          );
          const selectedItem = currentValue
            ? items.find((item) => item.value === currentValue)
            : undefined;
          const activeItem = items.find((item) => item.active);
          const currentItem = items.find((item) => item.id === tabStopId);

          const candidateItems = [
            selectedItem,
            activeItem,
            currentItem,
            ...items,
          ].filter(Boolean) as ItemData[];
          const candidateRefs = candidateItems.map((item) => item.ref);
          focusFirst(candidateRefs, false);
        }
      }
      isClickFocusRef.current = false;
    },
    [listProps.onFocus, isTabbingBackOut, currentValue, tabStopId]
  );

  const onMouseDown = useCallback(
    (event: MouseEvent<ListElement>) => {
      listProps.onMouseDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      isClickFocusRef.current = true;
    },
    [listProps.onMouseDown]
  );

  const focusContextValue = useMemo<FocusContextValue>(
    () => ({
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    }),
    [
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    ]
  );

  const ListPrimitive = asChild ? Slot : "div";

  return (
    <FocusContext.Provider value={focusContextValue}>
      <ListPrimitive
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="stepper-list"
        dir={context.dir}
        role="tablist"
        tabIndex={isTabbingBackOut || focusableItemCount === 0 ? -1 : 0}
        {...listProps}
        className={cn(
          "flex outline-none",
          orientation === "horizontal"
            ? "flex-row items-center"
            : "flex-col items-start",
          className
        )}
        onBlur={onBlur}
        onFocus={onFocus}
        onMouseDown={onMouseDown}
        ref={composedRef}
      >
        {children}
      </ListPrimitive>
    </FocusContext.Provider>
  );
}

type StepperItemContextValue = {
  value: string;
  stepState: StepState | undefined;
};

const StepperItemContext = createContext<StepperItemContextValue | null>(null);

function useStepperItemContext(consumerName: string) {
  const context = useContext(StepperItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface StepperItemProps extends DivProps {
  value: string;
  completed?: boolean;
  disabled?: boolean;
}

function StepperItem(props: StepperItemProps) {
  const {
    value: itemValue,
    completed = false,
    disabled = false,
    asChild,
    className,
    children,
    ref,
    ...itemProps
  } = props;

  const context = useStepperContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const orientation = context.orientation;
  const value = useStore((state) => state.value);

  useIsomorphicLayoutEffect(() => {
    store.addStep(itemValue, completed, disabled);

    return () => {
      store.removeStep(itemValue);
    };
  }, [itemValue, completed, disabled]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(itemValue, completed, disabled);
  }, [itemValue, completed, disabled]);

  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);
  const dataState = getDataState(value, itemValue, stepState, steps);

  const itemContextValue = useMemo<StepperItemContextValue>(
    () => ({
      value: itemValue,
      stepState,
    }),
    [itemValue, stepState]
  );

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <StepperItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        data-disabled={stepState?.disabled ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper-item"
        data-state={dataState}
        dir={context.dir}
        {...itemProps}
        className={cn(
          "relative flex not-last:flex-1 items-center",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className
        )}
        ref={ref}
      >
        {children}
      </ItemPrimitive>
    </StepperItemContext.Provider>
  );
}

function StepperTrigger(props: ButtonProps) {
  const { asChild, disabled, className, ref, ...triggerProps } = props;

  const context = useStepperContext(TRIGGER_NAME);
  const itemContext = useStepperItemContext(TRIGGER_NAME);
  const store = useStoreContext(TRIGGER_NAME);
  const focusContext = useFocusContext(TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const activationMode = context.activationMode;
  const orientation = context.orientation;
  const loop = context.loop;

  const steps = useStore((state) => state.steps);
  const stepIndex = Array.from(steps.keys()).indexOf(itemValue);

  const stepPosition = stepIndex + 1;
  const stepCount = steps.size;

  const triggerId = getId(context.id, "trigger", itemValue);
  const contentId = getId(context.id, "content", itemValue);
  const titleId = getId(context.id, "title", itemValue);
  const descriptionId = getId(context.id, "description", itemValue);

  const isDisabled = context.disabled || stepState?.disabled || disabled;
  const isActive = value === itemValue;
  const isTabStop = focusContext.tabStopId === triggerId;
  const dataState = getDataState(value, itemValue, stepState, steps);

  const triggerRef = useRef<TriggerElement>(null);
  const composedRef = useComposedRefs(ref, triggerRef);
  const isArrowKeyPressedRef = useRef(false);
  const isMouseClickRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (ARROW_KEYS.includes(event.key)) {
        isArrowKeyPressedRef.current = true;
      }
    }
    function onKeyUp() {
      isArrowKeyPressedRef.current = false;
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: triggerId,
      ref: triggerRef,
      value: itemValue,
      active: isTabStop,
      disabled: !!isDisabled,
    });

    if (!isDisabled) {
      focusContext.onFocusableItemAdd();
    }

    return () => {
      focusContext.onItemUnregister(triggerId);
      if (!isDisabled) {
        focusContext.onFocusableItemRemove();
      }
    };
  }, [focusContext, triggerId, itemValue, isTabStop, isDisabled]);

  const onClick = useCallback(
    async (event: MouseEvent<TriggerElement>) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (!(isDisabled || context.nonInteractive)) {
        const currentStepIndex = Array.from(steps.keys()).indexOf(value ?? "");
        const targetStepIndex = Array.from(steps.keys()).indexOf(itemValue);
        const direction = targetStepIndex > currentStepIndex ? "next" : "prev";

        await store.setStateWithValidation(itemValue, direction);
      }
    },
    [
      isDisabled,
      context.nonInteractive,
      store,
      itemValue,
      value,
      steps,
      triggerProps.onClick,
    ]
  );

  const onFocus = useCallback(
    async (event: FocusEvent<TriggerElement>) => {
      triggerProps.onFocus?.(event);
      if (event.defaultPrevented) {
        return;
      }

      focusContext.onItemFocus(triggerId);

      const isKeyboardFocus = !isMouseClickRef.current;

      if (
        !(isActive || isDisabled) &&
        activationMode !== "manual" &&
        !context.nonInteractive &&
        isKeyboardFocus
      ) {
        const currentStepIndex = Array.from(steps.keys()).indexOf(value || "");
        const targetStepIndex = Array.from(steps.keys()).indexOf(itemValue);
        const direction = targetStepIndex > currentStepIndex ? "next" : "prev";

        await store.setStateWithValidation(itemValue, direction);
      }

      isMouseClickRef.current = false;
    },
    [
      focusContext,
      triggerId,
      activationMode,
      isActive,
      isDisabled,
      context.nonInteractive,
      store,
      itemValue,
      value,
      steps,
      triggerProps.onFocus,
    ]
  );

  const onKeyDown = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignore this for now
    async (event: KeyboardEvent<TriggerElement>) => {
      triggerProps.onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Enter" && context.nonInteractive) {
        event.preventDefault();
        return;
      }

      if (
        (event.key === "Enter" || event.key === " ") &&
        activationMode === "manual" &&
        !context.nonInteractive
      ) {
        event.preventDefault();
        if (!isDisabled && triggerRef.current) {
          triggerRef.current.click();
        }
        return;
      }

      if (event.key === "Tab" && event.shiftKey) {
        focusContext.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) {
        return;
      }

      const focusIntent = getFocusIntent(event, context.dir, orientation);

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
          return;
        }
        event.preventDefault();

        const items = focusContext.getItems().filter((item) => !item.disabled);
        let candidateRefs = items.map((item) => item.ref);

        if (focusIntent === "last") {
          candidateRefs.reverse();
        } else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") {
            candidateRefs.reverse();
          }
          const currentIndex = candidateRefs.findIndex(
            (_ref) => _ref.current === event.currentTarget
          );
          candidateRefs = loop
            ? wrapArray(candidateRefs, currentIndex + 1)
            : candidateRefs.slice(currentIndex + 1);
        }

        if (store.hasValidation() && candidateRefs.length > 0) {
          const nextRef = candidateRefs[0];
          const nextElement = nextRef?.current;
          const nextItem = items.find(
            (item) => item.ref.current === nextElement
          );

          if (nextItem && nextItem.value !== itemValue) {
            const currentStepIndex = Array.from(steps.keys()).indexOf(
              value || ""
            );
            const targetStepIndex = Array.from(steps.keys()).indexOf(
              nextItem.value
            );
            const direction: NavigationDirection =
              targetStepIndex > currentStepIndex ? "next" : "prev";

            if (direction === "next") {
              const isValid = await store.setStateWithValidation(
                nextItem.value,
                direction
              );
              if (!isValid) {
                return;
              }
            } else {
              store.setState("value", nextItem.value);
            }

            queueMicrotask(() => nextElement?.focus());
            return;
          }
        }

        queueMicrotask(() => focusFirst(candidateRefs));
      }
    },
    [
      focusContext,
      context.nonInteractive,
      context.dir,
      activationMode,
      orientation,
      loop,
      isDisabled,
      triggerProps.onKeyDown,
      store,
      itemValue,
      value,
      steps,
    ]
  );

  const onMouseDown = useCallback(
    (event: MouseEvent<TriggerElement>) => {
      triggerProps.onMouseDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      isMouseClickRef.current = true;

      if (isDisabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(triggerId);
      }
    },
    [focusContext, triggerId, isDisabled, triggerProps.onMouseDown]
  );

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <TriggerPrimitive
      aria-controls={contentId}
      aria-current={isActive ? "step" : undefined}
      aria-describedby={`${titleId} ${descriptionId}`}
      aria-posinset={stepPosition}
      aria-selected={isActive}
      aria-setsize={stepCount}
      data-disabled={isDisabled ? "" : undefined}
      data-slot="stepper-trigger"
      data-state={dataState}
      disabled={isDisabled}
      id={triggerId}
      role="tab"
      tabIndex={isTabStop ? 0 : -1}
      type="button"
      {...triggerProps}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-md text-left outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "not-has-data-[slot=description]:rounded-full not-has-data-[slot=title]:rounded-full",
        className
      )}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      ref={composedRef}
    />
  );
}

interface StepperIndicatorProps extends Omit<DivProps, "children"> {
  children?: ReactNode | ((dataState: DataState) => ReactNode);
}

function StepperIndicator(props: StepperIndicatorProps) {
  const { className, children, asChild, ref, ...indicatorProps } = props;
  const context = useStepperContext(INDICATOR_NAME);
  const itemContext = useStepperItemContext(INDICATOR_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);

  const stepPosition = Array.from(steps.keys()).indexOf(itemValue) + 1;

  const dataState = getDataState(value, itemValue, stepState, steps);

  const IndicatorPrimitive = asChild ? Slot : "div";

  return (
    <IndicatorPrimitive
      data-slot="stepper-indicator"
      data-state={dataState}
      dir={context.dir}
      {...indicatorProps}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background font-medium text-muted-foreground text-sm transition-colors data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
        className
      )}
      ref={ref}
    >
      {typeof children === "function" ? (
        children(dataState)
      ) : children ? (
        children
      ) : dataState === "completed" ? (
        <Check className="size-4" />
      ) : (
        stepPosition
      )}
    </IndicatorPrimitive>
  );
}

interface StepperSeparatorProps extends DivProps {
  forceMount?: boolean;
}

function StepperSeparator(props: StepperSeparatorProps) {
  const {
    className,
    asChild,
    forceMount = false,
    ref,
    ...separatorProps
  } = props;

  const context = useStepperContext(SEPARATOR_NAME);
  const itemContext = useStepperItemContext(SEPARATOR_NAME);
  const value = useStore((state) => state.value);
  const orientation = context.orientation;

  const steps = useStore((state) => state.steps);
  const stepIndex = Array.from(steps.keys()).indexOf(itemContext.value);

  const isLastStep = stepIndex === steps.size - 1;

  if (isLastStep && !forceMount) {
    return null;
  }

  const dataState = getDataState(
    value,
    itemContext.value,
    itemContext.stepState,
    steps,
    "separator"
  );

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      aria-hidden="true"
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="stepper-separator"
      data-state={dataState}
      dir={context.dir}
      role="separator"
      {...separatorProps}
      className={cn(
        "bg-border transition-colors data-[state=active]:bg-primary data-[state=completed]:bg-primary",
        orientation === "horizontal" ? "h-px flex-1" : "h-10 w-px",
        className
      )}
      ref={ref}
    />
  );
}

interface StepperTitleProps extends ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperTitle(props: StepperTitleProps) {
  const { className, asChild, ref, ...titleProps } = props;

  const context = useStepperContext(TITLE_NAME);
  const itemContext = useStepperItemContext(TITLE_NAME);

  const titleId = getId(context.id, "title", itemContext.value);

  const TitlePrimitive = asChild ? Slot : "span";

  return (
    <TitlePrimitive
      data-slot="title"
      dir={context.dir}
      id={titleId}
      {...titleProps}
      className={cn("font-medium text-sm", className)}
      ref={ref}
    />
  );
}

interface StepperDescriptionProps extends ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperDescription(props: StepperDescriptionProps) {
  const { className, asChild, ref, ...descriptionProps } = props;
  const context = useStepperContext(DESCRIPTION_NAME);
  const itemContext = useStepperItemContext(DESCRIPTION_NAME);

  const descriptionId = getId(context.id, "description", itemContext.value);

  const DescriptionPrimitive = asChild ? Slot : "span";

  return (
    <DescriptionPrimitive
      data-slot="description"
      dir={context.dir}
      id={descriptionId}
      {...descriptionProps}
      className={cn("text-muted-foreground text-xs", className)}
      ref={ref}
    />
  );
}

interface StepperContentProps extends DivProps {
  value: string;
  forceMount?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const {
    value: valueProp,
    asChild,
    forceMount = false,
    ref,
    className,
    ...contentProps
  } = props;

  const context = useStepperContext(CONTENT_NAME);
  const value = useStore((state) => state.value);

  const contentId = getId(context.id, "content", valueProp);
  const triggerId = getId(context.id, "trigger", valueProp);

  if (valueProp !== value && !forceMount) {
    return null;
  }

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      aria-labelledby={triggerId}
      data-slot="stepper-content"
      dir={context.dir}
      id={contentId}
      role="tabpanel"
      {...contentProps}
      className={cn("flex-1 outline-none", className)}
      ref={ref}
    />
  );
}

function StepperPrevTrigger(props: ButtonProps) {
  const { asChild, disabled, ...prevTriggerProps } = props;

  const store = useStoreContext(PREV_TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const stepKeys = Array.from(steps.keys());
  const currentIndex = value ? stepKeys.indexOf(value) : -1;
  const isDisabled = disabled || currentIndex <= 0;

  const onClick = useCallback(
    // biome-ignore lint/suspicious/useAwait: Ignore this for now
    async (event: MouseEvent<HTMLButtonElement>) => {
      prevTriggerProps.onClick?.(event);
      if (event.defaultPrevented || isDisabled) {
        return;
      }

      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevStepValue = stepKeys[prevIndex];

      if (prevStepValue) {
        store.setState("value", prevStepValue);
      }
    },
    [prevTriggerProps.onClick, isDisabled, currentIndex, stepKeys, store]
  );

  const PrevTriggerPrimitive = asChild ? Slot : "button";

  return (
    <PrevTriggerPrimitive
      data-slot="stepper-prev-trigger"
      disabled={isDisabled}
      type="button"
      {...prevTriggerProps}
      onClick={onClick}
    />
  );
}

function StepperNextTrigger(props: ButtonProps) {
  const { asChild, disabled, ...nextTriggerProps } = props;

  const store = useStoreContext(NEXT_TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const stepKeys = Array.from(steps.keys());
  const currentIndex = value ? stepKeys.indexOf(value) : -1;
  const isDisabled = disabled || currentIndex >= stepKeys.length - 1;

  const onClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      nextTriggerProps.onClick?.(event);
      if (event.defaultPrevented || isDisabled) {
        return;
      }

      const nextIndex = Math.min(currentIndex + 1, stepKeys.length - 1);
      const nextStepValue = stepKeys[nextIndex];

      if (nextStepValue) {
        await store.setStateWithValidation(nextStepValue, "next");
      }
    },
    [nextTriggerProps.onClick, isDisabled, currentIndex, stepKeys, store]
  );

  const NextTriggerPrimitive = asChild ? Slot : "button";

  return (
    <NextTriggerPrimitive
      data-slot="stepper-next-trigger"
      disabled={isDisabled}
      type="button"
      {...nextTriggerProps}
      onClick={onClick}
    />
  );
}

export {
  StepperRoot as Root,
  StepperList as List,
  StepperItem as Item,
  StepperTrigger as Trigger,
  StepperIndicator as ItemIndicator,
  StepperSeparator as Separator,
  StepperTitle as Title,
  StepperDescription as Description,
  StepperContent as Content,
  StepperPrevTrigger as PrevTrigger,
  StepperNextTrigger as NextTrigger,
  //
  StepperRoot as Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperContent,
  StepperPrevTrigger,
  StepperNextTrigger,
  //
  useStore as useStepper,
  //
  type StepperRootProps as StepperProps,
};
