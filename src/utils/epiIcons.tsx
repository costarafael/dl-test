import {
  // Cabeça - Capacete (escudo/proteção)
  ShieldCheckIcon,
  // Mãos - Luvas (mão levantada)
  HandRaisedIcon,
  // Pés - Botas (mais adequado que archive)
  BuildingStorefrontIcon,
  // Olhos - Óculos
  EyeIcon,
  // Respiratória - Máscara (ícone de vento/ar)
  CloudIcon,
  // Quedas - Cinto (corrente/link)
  LinkIcon,
  // Auditiva - Ouvido (som/speaker)
  SpeakerWaveIcon,
  // Sinalização - Colete (luz/beacon)
  LightBulbIcon,
  // Corpo - Avental (usuário/pessoa)
  UserIcon,
  // Braços - Manga (braço/mão)
  HandRaisedIcon as ArmIcon,
  // Default
  CubeIcon
} from '@heroicons/react/24/outline';

// Mapeamento de categorias para ícones
export const getCategoryIcon = (categoria: string, className?: string) => {
  const iconProps = { className: className || "w-8 h-8" };
  
  switch (categoria) {
    case 'Proteção da Cabeça':
      return <ShieldCheckIcon {...iconProps} />;
    case 'Proteção das Mãos':
      return <HandRaisedIcon {...iconProps} />;
    case 'Proteção dos Pés':
      return <BuildingStorefrontIcon {...iconProps} />;
    case 'Proteção dos Olhos':
      return <EyeIcon {...iconProps} />;
    case 'Proteção Respiratória':
      return <CloudIcon {...iconProps} />;
    case 'Proteção contra Quedas':
      return <LinkIcon {...iconProps} />;
    case 'Proteção Auditiva':
      return <SpeakerWaveIcon {...iconProps} />;
    case 'Sinalização':
      return <LightBulbIcon {...iconProps} />;
    case 'Proteção do Corpo':
      return <UserIcon {...iconProps} />;
    case 'Proteção dos Braços':
      return <ArmIcon {...iconProps} />;
    default:
      return <CubeIcon {...iconProps} />;
  }
};