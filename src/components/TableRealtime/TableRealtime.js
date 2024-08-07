import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import "@fortawesome/fontawesome-free/css/all.css";

const TableRealtime = ({ rows, columns }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [orderBy, setOrderBy] = React.useState("");
  const [order, setOrder] = React.useState("asc");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortedRows = React.useMemo(() => {
    if (!orderBy) return rows;

    const stabilizedRows = rows.map((row, index) => [row, index]);
    stabilizedRows.sort((a, b) => {
      const orderMultiplier = order === "asc" ? 1 : -1;
      if (a[0][orderBy] < b[0][orderBy]) {
        return -1 * orderMultiplier;
      }
      if (a[0][orderBy] > b[0][orderBy]) {
        return 1 * orderMultiplier;
      }
      return 0;
    });
    return stabilizedRows.map((el) => el[0]);
  }, [rows, orderBy, order]);

  return (
    <div style={{ position: "relative" }}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      Width: column.Width,
                      cursor: column.sortable ? "pointer" : "default",
                      backgroundColor: "#EDEDED",
                    }}
                    onClick={
                      column.sortable ? () => handleSort(column.id) : undefined
                    }
                  >
                    {column.label}
                    {column.sortable && (
                      <i
                        className={`fas ${
                          orderBy === column.id
                            ? order === "asc"
                              ? "fa-sort-down"
                              : "fa-sort-up"
                            : "fa-sort"
                        }`}
                        style={{
                          color: orderBy === column.id ? "black" : "gray",
                          marginLeft: "8px",
                        }}
                      ></i>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default TableRealtime;
