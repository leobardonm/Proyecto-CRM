interface Column {
  header: string;
  accessor: string;
  cell?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  title?: string;
}

export default function Table({ columns, data, title }: TableProps) {
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            {title}
          </h2>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                    ${index === 0 ? 'rounded-tl-lg' : ''}
                    ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.accessor}`}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300"
                  >
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}