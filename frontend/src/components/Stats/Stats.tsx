/**
 * Represents a single statistic entry.
 */
export interface IStats {
  /**
   * Set the name of the stat.
   */
  name: string;
  /**
   * Set the actual value of the stat.
   */
  value: string;
}
/** Props for the `Stats` component, which are the same as `IStats`. */
export type StatsProps = IStats;
/**
 * Displays a single statistical data point.
 * - Shows a label (`name`) and a numeric/statistical value (`value`).
 * - Uses Tailwind CSS for styling.
 *
 * @param name - The name of the statistic.
 * @param value - The actual value of the statistic.
 */
export const Stats: React.FC<StatsProps> = ({ name, value }) => {
  /**
   * Renders the statistic card.
   *
   * @returns A styled React element displaying the statistic.
   */
  const render = (): React.ReactElement => {
    return (
      <div
        key={name}
        className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
      >
        <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
      </div>
    );
  };

  return render();
};
