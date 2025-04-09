// src/components/SensorTable.jsx
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from "lucide-react"; // Añadido Info
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Añadido Alert
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale'; // Importar locale español

export default function SensorTable({ columns = ['Fecha y Hora', 'Valor'], data = [] }) { // Valores por defecto
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Asegurarse que data sea siempre un array
  const validData = Array.isArray(data) ? data : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = validData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(validData.length / itemsPerPage);

  const paginate = (pageNumber) => {
      // Asegurar que la página esté dentro de los límites
      const newPage = Math.max(1, Math.min(pageNumber, totalPages || 1));
      setCurrentPage(newPage);
  }
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);

  // Resetear a página 1 si cambia itemsPerPage o los datos
  // Esto se podría hacer con un useEffect si los datos o itemsPerPage cambian desde fuera
  // useEffect(() => { setCurrentPage(1); }, [validData, itemsPerPage]);

  return (
    <motion.div
      className="w-full space-y-4" // Añadido space-y para separar Alert de la tabla
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* --- RÓTULO AÑADIDO AQUÍ --- */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Nota sobre los Datos</AlertTitle>
        <AlertDescription>
          El historial mostrado puede ser una muestra representativa cuando se seleccionan rangos de fechas muy amplios. Para un análisis detallado, por favor selecciona un periodo más corto.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((row, rowIndex) => {
                let date = null;
                try {
                  // Intentar parsear la fecha, manejar posible error si no es válida
                  if (row.fecha_hora) {
                    date = parseISO(row.fecha_hora);
                  }
                } catch (error) {
                  console.error("Error parsing date:", row.fecha_hora, error);
                  // Puedes mostrar un valor por defecto o '-' si la fecha es inválida
                }

                return (
                  <TableRow 
                    key={rowIndex} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {date ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {/* Formato de fecha en español */}
                            {format(date, "PPP", { locale: es })} 
                          </span>
                          <span className="text-xs text-gray-500">
                            {/* Formato de hora en español */}
                            {format(date, "p", { locale: es })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Fecha inválida</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {/* Mostrar 'N/A' si el valor es null o undefined */}
                        {row.valor !== null && row.valor !== undefined ? row.valor : 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              // Mensaje cuando no hay datos
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay datos disponibles para la selección actual.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación (solo si hay más de una página) */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            {/* Paginación móvil */}
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">
                Pág {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
            
            {/* Paginación desktop */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, validData.length)} 
                  </span>{' '}
                  de <span className="font-medium">{validData.length}</span> resultados
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1); // Resetear a página 1 al cambiar items por página
                  }}
                >
                  <SelectTrigger className="w-24 text-sm">
                    <SelectValue placeholder={`${itemsPerPage} por página`}/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-md"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    aria-label="Ir a primera página"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                     aria-label="Ir a página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Podrías añadir números de página aquí si quieres */}
                   <span className="relative inline-flex items-center px-4 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                     {currentPage}
                   </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                     aria-label="Ir a página siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-r-md"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                     aria-label="Ir a última página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}