import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--brand)] text-[var(--brand-text)]',
        secondary: 'border border-[var(--border)] bg-transparent text-[var(--text)]',
        ghost: 'hover:bg-[var(--surface-soft)] text-[var(--text)]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'min-h-12 px-6',
        sm: 'min-h-9 px-4 text-xs',
        lg: 'min-h-14 px-8 text-base',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
