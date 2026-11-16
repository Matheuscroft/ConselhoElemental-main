import React, { useState, useId, useRef } from 'react';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Contagem } from '@/components/motion/Contagem';
import { DialogoCabeca } from '@/components/fitness-kit/dialogo-cabeca';
import { useLuzDoDialogo } from '@/components/fitness-kit/dialogo-luz';
import { DialogoSilhueta } from '@/components/fitness-kit/dialogo-silhueta';
import '@/components/fitness-kit/dialogo-uau.css';
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

/** The measurements in three sections, so nine fields read as three small decisions. */
const BODY_MEASUREMENT_GROUPS: ReadonlyArray<{ title: string; keys: ReadonlyArray<keyof BodyMeasurementInput> }> = [
  { title: 'Medidas gerais', keys: ['heightCm', 'weightKg'] },
  { title: 'Composição', keys: ['waterPercent', 'bodyFatPercent', 'muscleMassKg'] },
  { title: 'Circunferências', keys: ['waistCm', 'chestCm', 'armCm', 'thighCm'] },
];

interface BodyMeasurementDialogProps {
  variant?: 'default' | 'fitness';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export const BodyMeasurementDialog: React.FC<BodyMeasurementDialogProps> = ({ open, onOpenChange, onSaved }) => {
  const titleId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);
  const ligarLuz = useLuzDoDialogo();
  const { addBodyMeasurement } = useWorkoutStore();
  const [form, setForm] = useState<FormState>({});
  const [focused, setFocused] = useState<keyof BodyMeasurementInput | null>(null);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    setForm({});
    setFocused(null);
  };

  const filled = BODY_MEASUREMENT_FIELDS.filter((field) => Number.isFinite(Number(form[field.key])) && (form[field.key] ?? '').trim() !== '');
  const focusedField = BODY_MEASUREMENT_FIELDS.find((field) => field.key === focused);

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
    setForm({});
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={ligarLuz}
        data-luz=""
        data-element="terra"
        showCloseButton={false}
        overlayClassName="dialogo-veu"
        onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}
        aria-labelledby={titleId} aria-describedby={undefined} className="dialogo-treino dg-avaliacao ds-glass-float">
        <DialogoCabeca icone={Scale} fechar="Fechar avaliação corporal" sobretitulo="Corpo">
          <DialogTitle id={titleId} className="dg-titulo">Registrar avaliação corporal</DialogTitle>
          <DialogDescription className="dg-descricao">Preencha só o que você mediu. Cada medida acende um ponto no corpo.</DialogDescription>
        </DialogoCabeca>
        <form className="dg-forma" noValidate onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <div className="dg-corpo">
            <div className="dg-palco" aria-hidden="true">
              <DialogoSilhueta foco={focused} preenchidas={filled.map((field) => field.key)} />
              <div className="dg-palco-leitura">
                <span className="dg-palco-rotulo">{focusedField ? 'Medindo agora' : 'Toque em uma medida'}</span>
                <strong className="dg-palco-nome">{focusedField?.label ?? 'Corpo'}</strong>
                <span className="dg-palco-valor">{focusedField && form[focusedField.key]?.trim() ? `${form[focusedField.key]} ${focusedField.unit}` : '—'}</span>
              </div>
            </div>
            {BODY_MEASUREMENT_GROUPS.map((group, index) => <section key={group.title} className="dg-secao" role="group" aria-labelledby={`${titleId}-g${index}`}>
              <div className="dg-secao-cab"><h3 id={`${titleId}-g${index}`} className="dg-secao-titulo">{group.title}</h3></div>
              <div className="dg-medidas">
                {group.keys.map((key) => {
                  const field = BODY_MEASUREMENT_FIELDS.find((item) => item.key === key)!;
                  return <label key={field.key} className="dg-campo" data-cheio={filled.some((item) => item.key === key) || undefined}>
                    <span className="dg-rotulo">{field.label}</span>
                    <span className="dg-caixa">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        placeholder="—"
                        autoComplete="off"
                        enterKeyHint="next"
                        value={form[field.key] ?? ''}
                        onFocus={() => setFocused(field.key)}
                        onBlur={() => setFocused((current) => current === field.key ? null : current)}
                        onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        className="dg-entrada"
                      />
                      <span className="dg-unidade" aria-hidden="true">{field.unit}</span>
                    </span>
                    <span className="sr-only">Unidade: {field.unit}</span>
                  </label>;
                })}
              </div>
            </section>)}
          </div>
          <footer className="dg-pe">
            <p className="dg-resumo"><span className="sr-only">{filled.length} de {BODY_MEASUREMENT_FIELDS.length} medidas preenchidas</span><span aria-hidden="true"><Contagem valor={filled.length} formatar={(valor) => String(Math.round(valor))} className="dg-resumo-numero" /> de {BODY_MEASUREMENT_FIELDS.length} medidas preenchidas</span></p>
            <div className="dg-pe-acoes">
              <button type="button" className="dg-btn" data-tipo="fantasma" onClick={() => handleOpenChange(false)}>Cancelar</button>
              <button type="submit" className="dg-btn" data-tipo="primario">Salvar</button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
};
