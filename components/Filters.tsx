
import { ClassSession } from '@/lib/schedule';
import { useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface FiltersProps {
    schedule: ClassSession[];
    filters: {
        course: string;
        day: string;
        period: string;
        subject: string;
        shift: string;
    };
    setFilters: (filters: any) => void;
}

export function Filters({ schedule, filters, setFilters }: FiltersProps) {

    // Extract unique options from data based on current context
    const options = useMemo(() => {
        const relevantSchedule = filters.course
            ? schedule.filter(s => s.course === filters.course)
            : schedule;

        const courses = Array.from(new Set(schedule.map(s => s.course).filter(Boolean))).sort();
        const days = Array.from(new Set(relevantSchedule.map(s => s.day).filter(Boolean))).sort();
        const periods = Array.from(new Set(relevantSchedule.map(s => s.period).filter(p => p && p.toLowerCase() !== 'período'))).sort();
        const subjects = Array.from(new Set(relevantSchedule.map(s => s.subject).filter(s => s && s.toLowerCase() !== 'disciplina'))).sort();
        const shifts = Array.from(new Set(relevantSchedule.map(s => s.shift).filter(Boolean))).sort();

        // Custom Sort for Days
        const dayOrder = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
        const sortedDays = days.sort((a, b) => {
            const indexA = dayOrder.findIndex(d => a.includes(d));
            const indexB = dayOrder.findIndex(d => b.includes(d));
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        // Custom Sort for Shift
        const shiftOrder = ["Manhã", "Tarde", "Noite"];
        const sortedShifts = shifts.sort((a, b) => {
            const indexA = shiftOrder.indexOf(a);
            const indexB = shiftOrder.indexOf(b);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        return { courses, days: sortedDays, periods, subjects, shifts: sortedShifts };
    }, [schedule, filters.course]);

    const handleChange = (key: string, value: string) => {
        const finalValue = value === "all" ? "" : value;

        if (key === 'course') {
            // Reset other filters when course changes
            setFilters({
                course: finalValue,
                day: '',
                period: '',
                subject: '',
                shift: ''
            });
        } else {
            setFilters((prev: any) => ({ ...prev, [key]: finalValue }));
        }
    };

    const clearFilters = () => {
        setFilters({ course: '', day: '', period: '', subject: '', shift: '' });
    };

    return (
        <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Course Filter (Primary - Wider) */}
                <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="course-filter" className="text-blue-200">Curso</Label>
                    <Select value={filters.course} onValueChange={(v) => handleChange('course', v)}>
                        <SelectTrigger id="course-filter" className="bg-slate-950 border-blue-900 text-slate-100 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione o Curso" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-blue-900 text-slate-100">
                            <SelectItem value="all">Todos os Cursos</SelectItem>
                            {options.courses.map(course => (
                                <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Period Filter */}
                <div className="space-y-2">
                    <Label htmlFor="period-filter" className="text-slate-400">Período</Label>
                    <Select value={filters.period} onValueChange={(v) => handleChange('period', v)} disabled={!filters.course && options.periods.length > 20}>
                        <SelectTrigger id="period-filter" className="bg-slate-950 border-slate-800 text-slate-100 focus:ring-blue-500">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-blue-900 text-slate-100 max-h-60">
                            <SelectItem value="all">Todos</SelectItem>
                            {options.periods.map(period => (
                                <SelectItem key={period} value={period}>{period}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Shift Filter (New) */}
                <div className="space-y-2">
                    <Label htmlFor="shift-filter" className="text-slate-400">Turno</Label>
                    <Select value={filters.shift} onValueChange={(v) => handleChange('shift', v)}>
                        <SelectTrigger id="shift-filter" className="bg-slate-950 border-slate-800 text-slate-100 focus:ring-blue-500">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-blue-900 text-slate-100">
                            <SelectItem value="all">Todos</SelectItem>
                            {options.shifts.map(shift => (
                                <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Day Filter */}
                <div className="space-y-2">
                    <Label htmlFor="day-filter" className="text-slate-400">Dia da Semana</Label>
                    <Select value={filters.day} onValueChange={(v) => handleChange('day', v)}>
                        <SelectTrigger id="day-filter" className="bg-slate-950 border-slate-800 text-slate-100 focus:ring-blue-500">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-blue-900 text-slate-100">
                            <SelectItem value="all">Todos</SelectItem>
                            {options.days.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-4">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white hover:bg-slate-800">
                    Limpar Filtros
                </Button>
            </div>
        </div>
    );
}
