// src/components/SensorTable.jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

export default function SensorTable({ columns, data }) {
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage, setItemsPerPage] = useState(10); // Elementos por página

  // Calcular los índices de los elementos a mostrar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navegación rápida (primera/última página)
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(Math.ceil(data.length / itemsPerPage));

  return (
    <motion.div
      className="w-full overflow-x-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Tabla */}
      <Table className="min-w-full border border-gray-200 shadow-lg rounded-lg">
        <TableHeader className="bg-gray-100">
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index} className="px-4 py-2 text-left font-semibold text-gray-700">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((row, rowIndex) => {
            const fechaHora = new Date(row.fecha_hora);
            const fecha = format(fechaHora, "dd/MM/yyyy"); // Formatear fecha
            const hora = format(fechaHora, "HH:mm:ss"); // Formatear hora

            return (
              <TableRow key={rowIndex} className="hover:bg-gray-50 transition-colors">
                <TableCell className="px-4 py-2 border-b">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{fecha}</span>
                    <span className="text-sm text-gray-500">{hora}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 border-b">
                  <span className="font-medium text-gray-900">{row.valor}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        {/* Botones de navegación */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {Math.ceil(data.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Elementos por página:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}