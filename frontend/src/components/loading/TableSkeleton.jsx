/** Shimmer placeholder rows so the table doesn't jump when data lands. */
const TableSkeleton = ({ rows = 6, columns = 5 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={`skeleton-row-${rowIndex}`}>
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <td key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
            <div
              className="skeleton-row"
              style={{ width: columnIndex === 0 ? "45%" : "75%" }}
            />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export default TableSkeleton;
