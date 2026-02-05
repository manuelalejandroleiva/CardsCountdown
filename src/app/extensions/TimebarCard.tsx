import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Heading,
  Text,
  Flex,
  StatusTag,
  ProgressBar,
  hubspot
} from "@hubspot/ui-extensions";

hubspot.extend(({ runServerlessFunction, context }) => (
  <TimebarCard
    runServerlessFunction={runServerlessFunction}
    objectId={"crm" in context ? context.crm?.objectId : undefined}
  />
));

const TimebarCard = ({ runServerlessFunction, objectId }: any) => {
  const [fechaFinal, setFechaFinal] = useState<number | null>(null);
  const [consumidoTime, setConsumidoTime] = useState<number | null>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const initialRemainingRef = useRef<number>(0); // tiempo total del countdown

  // --- Obtener SLA ---
  const obtenerSLA = useCallback(async () => {
    if (!objectId) return;

    try {
      const res: any = await runServerlessFunction({
        name: "sla",
        parameters: { objectId }
      });

      // Tiempo consumido
      if (res.response?.tiempo_consumido_sla) {
        const consumidoNumber = Number(res.response.tiempo_consumido_sla) / (1000 * 60 * 60);
        setConsumidoTime(consumidoNumber);
      }

      // Fecha final SLA
      let fecha: number | null = null;
      if (res.response?.tiempo_restante_sla) {
        fecha = new Date(res.response.tiempo_restante_sla).getTime();
      } else if (res.response?.createdDate) {
        const created = new Date(Number(res.response.createdDate));
        created.setDate(created.getDate() + 30);
        fecha = created.getTime();
      }

      if (fecha) {
        setFechaFinal(fecha);
        const remainingMs = fecha - Date.now();
        initialRemainingRef.current = remainingMs; // guardamos tiempo total para el porcentaje
        setTimeRemaining(Math.max(0, remainingMs));
      }
    } catch (err) {
      console.error("Error obteniendo SLA:", err);
      setFechaFinal(null);
      setTimeRemaining(null);
    }
  }, [objectId, runServerlessFunction]);


  const tick = () => {
    const remaining = fechaFinal ? fechaFinal - Date.now() : 0;
    setTimeRemaining(Math.max(0, remaining));

    // Actualizar porcentaje de la barra
    if (initialRemainingRef.current > 0) {
      const percentage = Math.min(
        100,
        Math.max(0, ((initialRemainingRef.current - remaining) / initialRemainingRef.current) * 100)
      );
      setProgress(percentage);
    }

    requestAnimationFrame(tick);
  };
  

  // --- Refrescar SLA cada 10 minutos ---
  useEffect(() => {
    obtenerSLA();
    const serverInterval = setInterval(obtenerSLA, 10 * 60 * 1000);
    return () => clearInterval(serverInterval);
  }, [obtenerSLA]);

  // --- Countdown + barra animada ---

  
  useEffect(() => {
    if (!fechaFinal) return;
    tick();
  }, [fechaFinal]);

  if (timeRemaining === null) return <Text>Loading SLA...</Text>;

  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  const estado =
    hoursRemaining > 8
      ? "success"
      : hoursRemaining > 0 && hoursRemaining <= 1
      ? "warning"
      : "danger";

  const estadoTexto =
    hoursRemaining > 8
      ? "A tiempo"
      : hoursRemaining > 0 && hoursRemaining <= 1
      ? "En Riesgo"
      : "Retrasado";

  // --- Formatear tiempo restante HH:MM:SS ---
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <Flex direction="column" gap="md">
     

      <Flex align="center" gap="medium">
        <Text variant="bodytext">Tiempo restante:</Text>

        <Heading >
      {timeRemaining > 0 ? formatTime(timeRemaining) : "Plazo vencido"}
  
      </Heading>
    <Heading>
    <StatusTag variant={estado}>{estadoTexto}</StatusTag>
    </Heading>

       
      </Flex>
    </Flex>
  );
};

export default TimebarCard;
