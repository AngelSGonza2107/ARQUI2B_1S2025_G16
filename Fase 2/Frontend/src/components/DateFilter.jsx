import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function DateFilter({ onChange }) {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [error, setError] = useState(null);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setError(null);
  };

  const handleConfirm = () => {
    if (!selectedSensor) {
      setError("Por favor, selecciona un sensor.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Por favor, selecciona un rango de fechas válido.");
      return;
    }
    if (startDate > endDate) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    // Formatear las fechas en el formato YYYY-MM-DD HH:MM:SS
    const startDateTime = `${format(startDate, "yyyy-MM-dd")} ${startTime}:00`;
    const endDateTime = `${format(endDate, "yyyy-MM-dd")} ${endTime}:00`;

    onChange({ sensor: selectedSensor, start: startDateTime, end: endDateTime });
    setError(null);
  };

  const handleClear = () => {
    setSelectedSensor(null);
    setStartDate(null);
    setEndDate(null);
    setStartTime("00:00");
    setEndTime("23:59");
    setError(null);
    onChange({ sensor: null, start: null, end: null });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-lg font-semibold text-center mb-4">Filtrar Datos</h2>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Seleccionar Sensor</Label>
          <Select onValueChange={setSelectedSensor} className="mt-1">
            <SelectTrigger className="w-full border-gray-300 shadow-sm">
              <SelectValue placeholder="Selecciona un sensor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperatura">Temperatura</SelectItem>
              <SelectItem value="humedad">Humedad</SelectItem>
              <SelectItem value="luz">Luz</SelectItem>
              <SelectItem value="calidadAire">Calidad del Aire</SelectItem>
              <SelectItem value="corriente">Corriente</SelectItem>
              <SelectItem value="distancia">Distancia</SelectItem>
              <SelectItem value="distancia_puerta">Distancia Puerta</SelectItem>
              <SelectItem value="puerta">Puerta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center">
          <Label className="text-sm font-medium">Seleccionar Rango de Fechas</Label>
          <div className="flex justify-center">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              dateFormat="yyyy-MM-dd"
              className="mt-2 p-2 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Hora de Inicio</Label>
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent focus:outline-none w-full"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Hora de Fin</Label>
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="text-center">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={handleClear} className="w-32">Limpiar</Button>
          <Button onClick={handleConfirm} className="w-32">Confirmar</Button>
        </div>
      </div>
    </div>
  );
}