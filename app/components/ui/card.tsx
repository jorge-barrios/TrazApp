import * as React from "react";
import { cn } from "~/lib/utils";

// Interfaces para mejorar la tipificación
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType; // Para pasar el ícono como un componente
  colorClass?: string; // Permitir estilos personalizados para el ícono
}

// Componente Card
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-sm transition-colors duration-200",
        {
          "border-gray-700 bg-gray-800 text-white hover:bg-gray-800/90":
            variant === "default",
          "border-red-800 bg-red-900 text-white hover:bg-red-900/90":
            variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Componente CardHeader
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// Componente CardTitle
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// Componente CardDescription
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-400", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// Componente CardContent
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// Componente CardFooter
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-2 p-6 pt-0",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// Componente adicional: CardIcon
const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ icon: Icon, colorClass = "text-blue-500", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center p-2 rounded-full bg-gray-700",
        className
      )}
      {...props}
    >
      <Icon className={`h-8 w-8 ${colorClass}`} />
    </div>
  )
);
CardIcon.displayName = "CardIcon";

export {
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type CardIconProps,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardIcon,
};
