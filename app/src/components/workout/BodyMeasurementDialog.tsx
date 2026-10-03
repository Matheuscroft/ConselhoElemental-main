import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { BodyMeasurementInput } from '@/types/workout';

export const BODY_MEASUREMENT_FIELDS: Array<{ key: keyof BodyMeasurementInput; label: string; unit: string }> = [
  { key: 'heightCm', label: 'Altura', unit: 'cm' },
  { key: 'weightKg', label: 'Peso', unit: 'kg' },
  { key: 'waterPercent', label: 'Água', unit: '%' },
  { key: 'bodyFatPercent', label: 'Gordura', unit: '%' },
  { key: 'muscleMassKg', label: 'Massa muscular', unit: 'kg' },
  { key: 'waistCm', label: 'Cintura', unit: 'cm' },
  { key: 'chestCm', label: 'Peito', unit: 'cm' },
  { key: 'armCm', label: 'Braço', unit: 'cm' },
  { key: 'thighCm', label: 'Coxa', unit: 'cm' },
];

type FormState = Partial<Record<keyof BodyMeasurementInput, string>>;

interface BodyMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export const BodyMeasurementDialog: React.FC<BodyMeasurementDialogProps> = ({ open, onOpenChange, onSaved }) => {
  const { addBodyMeasurement } = useWorkoutStore();
  const [form, setForm] = useState<FormState>({});

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (next) setForm({});
  };

  const handleSubmit = () => {
    const input: BodyMeasurementInput = {};
    let hasAnyValue = false;
    BODY_MEASUREMENT_FIELDS.forEach((field) => {
      const raw = form[field.key];
      if (raw && raw.trim() !== '') {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          (input as Record<string, number>)[field.key] = parsed;
          hasAnyValue = true;
        }
      }
    });

    if (!hasAnyValue) {
      toast.error('Preencha ao menos uma medida.');
      return;
    }

    addBodyMeasurement(input);
    toast.success('Avaliação registrada.');
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-mystic-purple/95 border-white/10 max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mystic">Registrar avaliação corporal</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {BODY_MEASUREMENT_FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="text-[10px] text-white/50 block mb-0.5">{field.label} ({field.unit})</span>
              <Input
                type="number"
                inputMode="decimal"
                value={form[field.key] ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="bg-white/5 border-white/15 h-9"
              />
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" className="bg-mystic-arcane hover:bg-mystic-arcane/80" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
