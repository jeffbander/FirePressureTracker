interface HeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children && (
          <div className="flex items-center space-x-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
