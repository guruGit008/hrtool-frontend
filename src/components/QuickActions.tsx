

interface QuickAction {
  name: string;
  icon: string;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.name}
          onClick={action.action}
          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="text-xl">{action.icon}</span>
          <span className={`font-medium ${action.color}`}>{action.name}</span>
        </button>
      ))}
    </div>
  );
} 