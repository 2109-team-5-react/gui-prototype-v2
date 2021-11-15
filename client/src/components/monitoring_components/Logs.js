import React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Title from "../Title";
import moment from "moment";

// Generate Log Data
// function createData(id, date, name, origin, stuff, stuff2) {
//   return { id, date, name, origin, stuff, stuff2 };
// }

// const rows = [
//   createData(0, "16 Mar, 2019", "Book Service", "0.0.0.0"),
//   createData(1, "16 Mar, 2019", "Book Service", "0.0.0.0"),
//   createData(2, "16 Mar, 2019", "Book Service", "0.0.0.0"),
//   createData(3, "16 Mar, 2019", "Book Service", "0.0.0.0"),
//   createData(4, "15 Mar, 2019", "Book Service", "0.0.0.0"),
// ];

// function preventDefault(event) {
//   event.preventDefault();
// }

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box minWidth={200}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.latency
        )} ms`}</Typography>
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Box>
    </Box>
  );
}

export default function Logs({ data }) {
  return (
    <React.Fragment>
      <Title>Slowest Requests</Title>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Root Fields</TableCell>
            <TableCell>Latency</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                {moment.unix(row.unixTime).format("MMM DD, 'YY @ HH:mm:ss")}
              </TableCell>
              <TableCell>{row.rootFields.join(", ")}</TableCell>
              <TableCell>
                <LinearProgressWithLabel
                  value={(row.latency * 100) / data[0].latency}
                  latency={row.latency}
                />
              </TableCell>
              <TableCell>{"placeholder"}</TableCell>
              <TableCell>{"placeholder"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
