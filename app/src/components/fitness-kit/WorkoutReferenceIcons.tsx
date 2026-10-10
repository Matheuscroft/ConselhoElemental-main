import React, { useId } from 'react';

// Ícones da captura fornecida pelo usuário, sem substituição por pictogramas similares.
// O canal azul separa as figuras violetas do fundo; a área da figura é recortada no SVG.
const SOURCE = '/fitness-kit/workout-selection-reference.png';
type IconProps = React.SVGProps<SVGSVGElement>;
const ReferenceIcon: React.FC<IconProps & { region: [number, number, number, number] }> = ({ region: [x, y, width, height], ...props }) => {
  const id = `fitness-reference-${useId().replace(/:/g, '')}`;
  return (
    <svg {...props} viewBox={`0 0 ${width} ${height}`} fill="none" focusable="false">
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 .5215686  0 0 0 0 .5098039  0 0 0 0 .9490196  0 0 1.4 0 -.32" />
        </filter>
      </defs>
      <svg width={width} height={height} viewBox={`${x} ${y} ${width} ${height}`}>
        <image href={SOURCE} width="838" height="1830" filter={`url(#${id})`} />
      </svg>
    </svg>
  );
};
export const RunningReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[188, 454, 90, 90]} />;
export const CoreReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[542, 525, 114, 86]} />;
export const SwimmingReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[176, 783, 105, 82]} />;
export const MartialArtsReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[537, 916, 116, 97]} />;
export const YogaReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[171, 1180, 104, 98]} />;
export const CyclingReferenceIcon: React.FC<IconProps> = (props) => <ReferenceIcon {...props} region={[540, 1264, 115, 100]} />;
