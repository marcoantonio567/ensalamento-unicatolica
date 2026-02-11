
"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchSchedule, ClassSession } from "@/lib/schedule";
import { ScheduleCard } from "@/components/ScheduleCard";
import { Filters } from "@/components/Filters";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: '',
    day: '',
    period: '',
    subject: '',
    shift: '',
    search: '' // New search state
  });

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/schedule');
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to load schedule", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredSchedule = useMemo(() => {
    return schedule.filter(s => {
      const matchesCourse = !filters.course || s.course === filters.course;
      const matchesDay = !filters.day || s.day.includes(filters.day);
      const matchesPeriod = !filters.period || s.period === filters.period;
      const matchesSubject = !filters.subject || s.subject === filters.subject;
      const matchesShift = !filters.shift || s.shift === filters.shift;

      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        s.subject.toLowerCase().includes(searchLower) ||
        s.professor.toLowerCase().includes(searchLower);

      return matchesCourse && matchesDay && matchesPeriod && matchesSubject && matchesShift && matchesSearch;
    });
  }, [schedule, filters]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center md:text-left border-b border-slate-900 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            Centro Universitário Católica do Tocantins
          </h1>
          <p className="text-slate-400 text-lg">Ensalamento e Horários 2026/1</p>
        </header>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-500">Carregando horários...</p>
          </div>
        ) : (
          <>
            <Filters schedule={schedule} filters={filters} setFilters={setFilters} />

            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-slate-500">
                <span className="hidden sm:inline">Exibindo </span>
                <span className="font-bold text-white">{filteredSchedule.length}</span> aulas
                {filters.course && <span className="ml-1 text-slate-600">em {filters.course}</span>}
              </p>
            </div>

            {filteredSchedule.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-900 border-dashed">
                <p className="text-xl">Nenhuma aula encontrada com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSchedule.map((session) => (
                  <ScheduleCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
