import { cn } from '@/lib/utils';

interface TableProps { children: React.ReactNode; className?: string; }

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(13,115,119,0.12)' }}>
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid rgba(13,115,119,0.12)', background: 'rgba(13,115,119,0.04)' }}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap', className)}
      style={{ color: 'var(--text-3)' }}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y" style={{ borderColor: 'rgba(13,115,119,0.07)' }}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children, className, onClick,
}: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn('transition-colors duration-100', onClick && 'cursor-pointer', className)}
      style={{ borderColor: 'rgba(13,115,119,0.07)' }}
      onMouseEnter={onClick ? (e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.03)'; }) : undefined}
      onMouseLeave={onClick ? (e => { (e.currentTarget as HTMLElement).style.background = ''; }) : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3.5 text-[13px]', className)} style={{ color: 'var(--text-2)' }}>
      {children}
    </td>
  );
}
