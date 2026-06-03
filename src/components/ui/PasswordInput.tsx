import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { cn } from '../../lib/utils'

type Props = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  className?: string
  inputClassName?: string
}

export function PasswordInput({ className, inputClassName, ...props }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('w-full pr-11', inputClassName)}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-800 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
