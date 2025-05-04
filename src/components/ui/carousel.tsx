"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

// Create a carousel context to make controls available
type CarouselApi = UseEmblaCarouselType[1];
type CarouselContextType = {
  carouselApi: CarouselApi | null;
  currentIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextType | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: any;
  plugins?: any[];
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

export function Carousel({
  opts,
  plugins,
  orientation = "horizontal",
  setApi,
  className,
  children,
  ...props
}: CarouselProps) {
  const [carouselRef, carouselApi] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  // Update state when carousel is ready or changes
  React.useEffect(() => {
    if (!carouselApi) return;

    setApi?.(carouselApi);
    onSelect(carouselApi);
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi, onSelect, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselApi,
        currentIndex,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={carouselRef}
        className={cn(
          "overflow-hidden",
          orientation === "horizontal" ? "w-full" : "h-full",
          className
        )}
        {...props}
      >
        <div className="flex h-full">{children}</div>
      </div>
    </CarouselContext.Provider>
  );
}

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
}

export function CarouselContent({
  className,
  gap = 16,
  ...props
}: CarouselContentProps) {
  return (
    <div
      className={cn("flex h-full w-full flex-row", className)}
      style={{ gap: `${gap}px` }}
      {...props}
    />
  );
}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
}

export function CarouselItem({
  className,
  width = "100%",
  ...props
}: CarouselItemProps) {
  return (
    <div
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      style={{ flex: `0 0 ${width}` }}
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { carouselApi, canScrollPrev } = useCarousel();

  return (
    <button
      className={cn(
        "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-30",
        className
      )}
      onClick={() => carouselApi?.scrollPrev()}
      disabled={!canScrollPrev}
      {...props}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

export function CarouselNext({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { carouselApi, canScrollNext } = useCarousel();

  return (
    <button
      className={cn(
        "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-30",
        className
      )}
      onClick={() => carouselApi?.scrollNext()}
      disabled={!canScrollNext}
      {...props}
    >
      <ChevronRight className="h-5 w-5" />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export function CarouselDots({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselApi, currentIndex } = useCarousel();
  const scrollSnaps = React.useMemo(() => {
    if (!carouselApi) return [];
    const snaps = carouselApi.scrollSnapList();
    return snaps;
  }, [carouselApi]);

  return (
    <div
      className={cn("flex items-center justify-center gap-1 pt-3", className)}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full bg-muted-foreground/30 transition-all",
            index === currentIndex && "w-4 bg-primary"
          )}
          onClick={() => carouselApi?.scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
