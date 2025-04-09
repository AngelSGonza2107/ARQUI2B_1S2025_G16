// src/components/DateFilter.jsx
import { useState } from "react";
import { Calendar, Clock, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from 'date-fns/locale'; // Importar locale español
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComp } from "@/components/ui/calendar";

export default function DateFilter({ onSubmit, isLoading }) { // Añadido isLoading para deshabilitar botón si es necesario
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [error, setError] = useState(null);

  const handleConfirm = () => {
    setError(null); // Limpiar error anterior
    if (!selectedSensor) {
      setError("Por favor, selecciona un sensor.");
      return;
    }
    if (!dateRange.from) { // Solo se necesita 'from' si 'to' puede ser opcional o igual a 'from'
      setError("Por favor, selecciona al menos una fecha de inicio.");
      return;
    }
    // Permitir selección de un solo día (from y to son iguales)
    const finalDateRange = {
        from: dateRange.from,
        to: dateRange.to || dateRange.from // Si 'to' no está definido, usar 'from'
    };

    if (finalDateRange.from > finalDateRange.to) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    const startDateTime = `${format(finalDateRange.from, "yyyy-MM-dd")} ${startTime}:00`;
    const endDateTime = `${format(finalDateRange.to, "yyyy-MM-dd")} ${endTime}:00`;

    onSubmit({ 
      sensor: selectedSensor, 
      start: startDateTime, 
      end: endDateTime 
    });
  };

  const handleClear = () => {
    setSelectedSensor(null);
    setDateRange({ from: undefined, to: undefined });
    setStartTime("00:00");
    setEndTime("23:59");
    setError(null);
    // Opcional: podrías querer limpiar los resultados también
    // onSubmit({ sensor: null, start: null, end: null }); 
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <div>
        <Label htmlFor="sensor-select" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Activity className="w-4 h-4" />
          Sensor a consultar
        </Label>
        <Select 
          onValueChange={setSelectedSensor} 
          value={selectedSensor || ""}
          disabled={isLoading} // Deshabilitar si está cargando
        >
          <SelectTrigger id="sensor-select" className="w-full">
            <SelectValue placeholder="Selecciona un sensor" />
          </SelectTrigger>
          <SelectContent>
            {/* Agrega aquí tus sensores */}
            <SelectItem value="temperatura">Temperatura</SelectItem>
            <SelectItem value="humedad">Humedad</SelectItem>
            <SelectItem value="luz">Estado de la Luz</SelectItem>
            <SelectItem value="calidadAire">Calidad del Aire</SelectItem>
            <SelectItem value="corriente">Corriente Eléctrica</SelectItem>
            <SelectItem value="distancia">Distancia</SelectItem>
            <SelectItem value="distancia_puerta">Distancia de la Puerta</SelectItem>
            <SelectItem value="puerta">Estado de la Puerta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Rango de fechas
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isLoading} // Deshabilitar si está cargando
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {/* Formato en español */}
                    {format(dateRange.from, "dd 'de' LLLL 'de' y", { locale: es })} -{" "}
                    {format(dateRange.to, "dd 'de' LLLL 'de' y", { locale: es })}
                  </>
                ) : (
                  // Formato en español para una sola fecha
                  format(dateRange.from, "dd 'de' LLLL 'de' y", { locale: es })
                )
              ) : (
                <span>Selecciona un rango</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* --- CAMBIO AQUÍ --- */}
            <CalendarComp
              mode="range"
              locale={es} // Usar locale español en el calendario
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1} // Mostrar solo un mes
              initialFocus
              // Nota sobre el color: El color de selección (el negro que mencionaste)
              // usualmente se controla por CSS. Busca en tu `globals.css` o archivo de estilos
              // las reglas para `.rdp-day_selected` (o similar, depende de react-day-picker / shadcn)
              // y cambia el `background-color` y `color` a los colores de tu tema.
              // Ejemplo (podría necesitar ajustarse):
              // .rdp-day_selected { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Hora de inicio
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isLoading} // Deshabilitar si está cargando
          />
        </div>
        <div>
          <Label htmlFor="end-time" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Hora de fin
          </Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isLoading} // Deshabilitar si está cargando
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          Limpiar
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={!selectedSensor || !dateRange.from || isLoading} // Deshabilitar si falta selección o está cargando
        >
          {isLoading ? 'Consultando...' : 'Aplicar Filtros'}
        </Button>
      </div>
    </div>
  );
}