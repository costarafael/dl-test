import React from 'react';
import { Badge } from 'flowbite-react';

interface IconContainerProps {
  icon: React.ReactNode;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';
  size?: 'sm' | 'lg';
  className?: string;
}

const IconContainer: React.FC<IconContainerProps> = ({ 
  icon, 
  color = 'gray', 
  size = 'lg',
  className = ''
}) => {
  return (
    <Badge 
      color={color} 
      size={size} 
      className={`p-2 rounded-sm w-fit flex items-center justify-center ${className}`}
    >
      {icon}
    </Badge>
  );
};

export default IconContainer;