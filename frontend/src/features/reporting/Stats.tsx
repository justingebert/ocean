export interface IStats {
  name: string;

  value: string;
}

export type StatsProps = IStats;

export const Stats: React.FC<StatsProps> = ({ name, value }) => {
  const render = (): React.ReactElement => {
    return (
      <div key={name} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
      </div>
    );
  };

  return render();
};
