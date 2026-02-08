import React, { useCallback, useEffect, useState } from "react";
import { Heading, Text, Flex, StatusTag, hubspot } from "@hubspot/ui-extensions";

/* ============================
   HUBSPOT EXTENSION
============================ */
hubspot.extend(({ runServerlessFunction, context }) => (
  <TimebarCard
    runServerlessFunction={runServerlessFunction}
    objectId={"crm" in context ? context.crm?.objectId : undefined}
  />
));

/* ============================
   TYPES
============================ */
type StageSLA = {
  stageId: string;
  stageName: string;
  fechaFinal: number;
  initialRemaining: number;
  noSla?: boolean;
};

type SLAConfig = {
  label: string;
  dateField?: string;
};

/* ============================
   SLA CONFIG (REUTILIZABLE)
============================ */
const SLA_CONFIG: Record<string, SLAConfig> = {
  "1": {
    label: "",
    dateField: "tiempo_restante_sla"
  },
  "2": {
    label: "",
    dateField: "tiempo_restante_sla_2"
  }
};

/* ============================
   NORMALIZAR SLA
============================ */
const buildStageSla = (r: any): StageSLA | null => {
  if (!r?.stage) return null;

  const config = SLA_CONFIG[r.stage];

  if (!config || !config.dateField || !r[config.dateField]) {
    return {
      stageId: r.stage,
      stageName: "No existe SLA asignado",
      fechaFinal: 0,
      initialRemaining: 0,
      noSla: true
    };
  }

  const now = Date.now();
  const fecha = new Date(r[config.dateField]).getTime();

  return {
    stageId: r.stage,
    stageName: config.label,
    fechaFinal: fecha,
    initialRemaining: Math.max(0, fecha - now)
  };
};

/* ============================
   HOOK SLA (REUTILIZABLE)
============================ */
const useSLA = (
  objectId: string | undefined,
  runServerlessFunction: any
) => {
  const [stageSla, setStageSla] = useState<StageSLA | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSLA = useCallback(async () => {
    if (!objectId) {
      setLoading(false);
      return;
    }

    try {
      const res = await runServerlessFunction({
        name: "sla",
        parameters: { objectId }
      });

      setStageSla(buildStageSla(res?.response));
    } catch (e) {
      console.error("Error obteniendo SLA:", e);
      setStageSla(null);
    } finally {
      setLoading(false);
    }
  }, [objectId, runServerlessFunction]);

  useEffect(() => {
    fetchSLA();
    const interval = setInterval(fetchSLA, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSLA]);

  return { stageSla, loading };
};

/* ============================
   MAIN COMPONENT
============================ */
const TimebarCard = ({ runServerlessFunction, objectId }: any) => {
  const { stageSla, loading } = useSLA(objectId, runServerlessFunction);

  if (loading) return <Text>Loading SLA…</Text>;
  if (!stageSla || stageSla.noSla)
    return <Text>No existe SLA asignado</Text>;

  return (
    <Flex direction="column" gap="sm">
      <Heading>{stageSla.stageName}</Heading>
      <Countdown endDate={stageSla.fechaFinal} />
    </Flex>
  );
};

/* ============================
   COUNTDOWN GENÉRICO
============================ */
const Countdown = ({ endDate }: { endDate: number }) => {
  const [remaining, setRemaining] = useState(
    Math.max(0, endDate - Date.now())
  );

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const r = Math.max(0, endDate - Date.now());
      setRemaining(r);
      if (r > 0) raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [endDate]);

  const hours = remaining / (1000 * 60 * 60);

  const estado =
    hours > 8 ? "success" : hours > 0 ? "warning" : "danger";

  const texto =
    hours > 8 ? "A tiempo" : hours > 0 ? "En riesgo" : "Retrasado";

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <Flex align="center" gap="md">
      <Text>
        {remaining > 0 ? formatTime(remaining) : "Plazo vencido"}
      </Text>
      <StatusTag variant={estado}>{texto}</StatusTag>
    </Flex>
  );
};

export default TimebarCard;
