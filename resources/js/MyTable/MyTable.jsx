// import React from 'react';
// import { useTable } from 'react-table';

// const IconChevronUp = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
//   </svg>
// );

// const IconChevronDown = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//   </svg>
// );

// // Default row wrapper — plain <tr>, unchanged behavior for tables that
// // don't need drag-and-drop.
// const DefaultRow = ({ rowProps, className, children }) => (
//   <tr {...rowProps} className={className}>
//     {children}
//   </tr>
// );

// const MyTable = ({ columns, data, pagination, renderRow }) => {
//   // NOTE: useSortBy removed. It re-derives `rows` from internal state on
//   // every render, which desyncs @dnd-kit's tracked DOM nodes mid-drag.
//   // Column click-to-sort and drag-to-reorder don't mix well in the same
//   // table; if you need sort-by-column elsewhere, keep it on a table that
//   // doesn't also support drag reordering.
//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//   } = useTable({
//     columns,
//     data,
//   });

//   const { key: tableKey, ...tableProps } = getTableProps();

//   const RowWrapper = renderRow || DefaultRow;

//   return (
//     <div className="w-full bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden mt-6 text-neutral">
//       <div className="overflow-x-auto">
//         <table {...tableProps} className="w-full">
//           <thead className="bg-blue-50/40">
//             {headerGroups.map(headerGroup => {
//               const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
//               return (
//                 <tr key={headerGroupKey} {...headerGroupProps}>
//                   {headerGroup.headers.map(column => {
//                     const { key: headerKey, ...headerProps } = column.getHeaderProps();
//                     return (
//                       <th
//                         key={headerKey}
//                         {...headerProps}
//                         className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase border-b border-blue-100 bg-blue-100 backdrop-blur-sm"
//                       >
//                         <div className="flex items-center justify-between">
//                           <span className="font-medium">{column.render('Header')}</span>
//                         </div>
//                       </th>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </thead>

//           <tbody {...getTableBodyProps()} className="divide-y divide-blue-100/50">
//             {rows.map((row, rowIndex) => {
//               prepareRow(row);
//               const { key: rowKey, ...rowProps } = row.getRowProps();
//               const rowClassName = `transition-colors duration-150 ${
//                 rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
//               } hover:bg-gray-200`;

//               const cells = row.cells.map(cell => {
//                 const { key: cellKey, ...cellProps } = cell.getCellProps();
//                 return (
//                   <td
//                     key={cellKey}
//                     {...cellProps}
//                     className="px-6 py-4 whitespace-nowrap text-sm"
//                   >
//                     {cell.render('Cell')}
//                   </td>
//                 );
//               });

//               return (
//                 <RowWrapper
//                   key={row.original?.id ?? rowKey}
//                   row={row}
//                   rowIndex={rowIndex}
//                   rowProps={rowProps}
//                   className={rowClassName}
//                 >
//                   {cells}
//                 </RowWrapper>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {pagination && (
//         <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-300">
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center sm:gap-2 gap-0.5">
//               <button
//                 onClick={() => pagination.onPageChange(1)}
//                 disabled={pagination.currentPage === 1}
//                 className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//               >
//                 {'<<'}
//               </button>
//               <button
//                 onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
//                 disabled={pagination.currentPage === 1}
//                 className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//               >
//                 {'<'}
//               </button>
//               <button
//                 onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
//                 disabled={pagination.currentPage === pagination.lastPage}
//                 className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//               >
//                 {'>'}
//               </button>
//               <button
//                 onClick={() => pagination.onPageChange(pagination.lastPage)}
//                 disabled={pagination.currentPage === pagination.lastPage}
//                 className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//               >
//                 {'>>'}
//               </button>
//             </div>

//             <span className="text-sm">
//               Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.lastPage}</strong>
//             </span>

//             <select
//               value={pagination.perPage}
//               onChange={(e) => pagination.onPerPageChange(Number(e.target.value))}
//               className="border rounded-full p-1 pr-8 pl-4 bg-gray-200 text-sm"
//             >
//               {[10, 20, 30, 40, 50].map(size => (
//                 <option key={size} value={size}>
//                   Show {size}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyTable;



import React from 'react';
import { useTable } from 'react-table';

const IconChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Default row wrapper — plain <tr>, unchanged behavior for tables that
// don't need drag-and-drop.
const DefaultRow = ({ rowProps, className, children }) => (
  <tr {...rowProps} className={className}>
    {children}
  </tr>
);

const MyTable = ({ columns, data, pagination, renderRow }) => {
  // NOTE: useSortBy removed. It re-derives `rows` from internal state on
  // every render, which desyncs @dnd-kit's tracked DOM nodes mid-drag.
  // Column click-to-sort and drag-to-reorder don't mix well in the same
  // table; if you need sort-by-column elsewhere, keep it on a table that
  // doesn't also support drag reordering.
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  const { key: tableKey, ...tableProps } = getTableProps();

  const RowWrapper = renderRow || DefaultRow;

  return (
    <div className="w-full bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden mt-6 text-neutral">
      {/* table-fixed forces columns to respect their intended widths instead
          of growing to fit content — this, combined with removing
          whitespace-nowrap below, is what eliminates the need to scroll. */}
      <div className="w-full">
        <table {...tableProps} className="w-full table-fixed">
          <thead className="bg-blue-50/40">
            {headerGroups.map(headerGroup => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th
                        key={headerKey}
                        {...headerProps}
                        className="px-4 py-4 text-xs font-semibold tracking-wider text-left uppercase border-b border-blue-100 bg-blue-100 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{column.render('Header')}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>

          <tbody {...getTableBodyProps()} className="divide-y divide-blue-100/50">
            {rows.map((row, rowIndex) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              const rowClassName = `transition-colors duration-150 ${
                rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
              } hover:bg-gray-200`;

              const cells = row.cells.map(cell => {
                const { key: cellKey, ...cellProps } = cell.getCellProps();
                return (
                  <td
                    key={cellKey}
                    {...cellProps}
                    className="px-4 py-4 text-sm align-middle overflow-hidden"
                  >
                    {cell.render('Cell')}
                  </td>
                );
              });

              return (
                <RowWrapper
                  key={row.original?.id ?? rowKey}
                  row={row}
                  rowIndex={rowIndex}
                  rowProps={rowProps}
                  className={rowClassName}
                >
                  {cells}
                </RowWrapper>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-300">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center sm:gap-2 gap-0.5">
              <button
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage === 1}
                className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
              >
                {'<<'}
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
              >
                {'<'}
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
              >
                {'>'}
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.lastPage)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
              >
                {'>>'}
              </button>
            </div>

            <span className="text-sm">
              Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.lastPage}</strong>
            </span>

            <select
              value={pagination.perPage}
              onChange={(e) => pagination.onPerPageChange(Number(e.target.value))}
              className="border rounded-full p-1 pr-8 pl-4 bg-gray-200 text-sm"
            >
              {[10, 20, 30, 40, 50].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTable;