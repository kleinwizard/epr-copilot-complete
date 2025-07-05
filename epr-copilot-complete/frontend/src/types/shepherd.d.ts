declare module 'shepherd.js' {
  export interface StepOptions {
    id?: string;
    title?: string;
    text?: string;
    attachTo?: {
      element: string | Element;
      on: string;
    };
    buttons?: Array<{
      text: string;
      classes?: string;
      action?: () => void;
    }>;
    classes?: string;
    scrollTo?: boolean;
    cancelIcon?: {
      enabled: boolean;
    };
    when?: {
      show?: () => void;
      hide?: () => void;
    };
  }

  export interface TourOptions {
    useModalOverlay?: boolean;
    defaultStepOptions?: StepOptions;
  }

  export class Tour {
    constructor(options?: TourOptions);
    addStep(options: StepOptions): void;
    start(): void;
    next(): void;
    back(): void;
    cancel(): void;
    complete(): void;
    getCurrentStep(): any;
    hide(): void;
    show(): void;
  }

  export default class Shepherd {
    static Tour: typeof Tour;
  }
}
