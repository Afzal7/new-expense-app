"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { getCategoryIconName } from "@/lib/constants/categories";

interface CategoryIconProps {
  category?: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({
  category,
  className,
  size = 20,
}: CategoryIconProps) {
  const iconName = getCategoryIconName(category) as keyof typeof LucideIcons;
  const Icon = (LucideIcons[iconName] as React.ElementType) || LucideIcons.Briefcase;

  return <Icon className={className} size={size} />;
}
