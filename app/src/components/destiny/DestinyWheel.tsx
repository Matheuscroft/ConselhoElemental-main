import { motion } from 'framer-motion';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import type { DestinyOption } from './destiny-options';
const TINT = { terra: '#263e36', fogo: '#4b302b', agua: '#203d4e', ar: '#34424b' };

export function DestinyWheel({ options, rotation, spinning, reduced }: { options: DestinyOption[]; rotation: number; spinning: boolean; reduced: boolean }) {
  // A rune ring remains legible for large catalogues; the list exposes every real option.
  const detailed = options.length > 0 && options.length <= 12;
  const slices = detailed ? options : Array.from({ length: 8 }, (_, index) => ({ key: `rune-${index}`, element: (['terra', 'fogo', 'agua', 'ar'] as const)[index % 4] }));
  const angle = 360 / slices.length;
  return <div className="destiny-wheel-stage" data-spinning={spinning} aria-hidden="true">
    {detailed && <span className="destiny-pointer" />}
    <div className="destiny-wheel-rim"><motion.div className="destiny-wheel-disc" animate={{ rotate: rotation }} transition={{ duration: reduced ? 0 : 2.6, ease: [.15,.75,.15,1] }}>
      <svg viewBox="0 0 320 320" focusable="false"><circle cx="160" cy="160" r="153" fill="#101620" />
        {slices.map((item, index) => {
          const start = (index * angle - 90) * Math.PI / 180;
          const end = ((index + 1) * angle - 90) * Math.PI / 180;
          const center = ((index + .5) * angle - 90) * Math.PI / 180;
          return <g key={item.key}>
            {slices.length === 1 ? <circle cx="160" cy="160" r="149" fill={TINT[item.element]} /> : <path d={`M160 160 L${160 + 149 * Math.cos(start)} ${160 + 149 * Math.sin(start)} A149 149 0 ${angle > 180 ? 1 : 0} 1 ${160 + 149 * Math.cos(end)} ${160 + 149 * Math.sin(end)} Z`} fill={TINT[item.element]} stroke="#d5b66f44" strokeWidth="1" />}
            <g transform={`translate(${160 + 108 * Math.cos(center) - 12} ${160 + 108 * Math.sin(center) - 12})`} color="#e0c88c"><ArcaneIcon name={item.element} size={24} /></g>
            {detailed && <text x={160 + 73 * Math.cos(center)} y={164 + 73 * Math.sin(center)} textAnchor="middle" fill="#f2efe7" fontSize="11">{index + 1}</text>}
          </g>;
        })}
        <circle cx="160" cy="160" r="142" fill="none" stroke="#d5b66f33" />
        {Array.from({ length: 48 }, (_, index) => <path key={index} d={`M160 5v${index % 4 === 0 ? 9 : 4}`} transform={`rotate(${index * 7.5} 160 160)`} stroke="#d5b66f" strokeOpacity={.5} />)}
      </svg>
    </motion.div></div>
    <div className="destiny-wheel-center"><ArcaneIcon name="cassino" size={36} /><span>{spinning ? 'Escolhendo' : 'Destino'}</span></div>
  </div>;
}
