import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'Tag',
  className = 'w-5 h-5',
  size = 20,
}) => {
  const IconComponent =
    ((Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[
      name
    ]) || Icons.Tag;

  return <IconComponent size={size} className={className} />;
};
