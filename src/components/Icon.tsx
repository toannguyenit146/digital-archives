import React from 'react';
import { Text } from 'react-native';

const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 20,
  color = "#000",
}) => {
  const iconMap: { [key: string]: string } = {
    menu: "☰",
    search: "🔍",
    notifications: "🔔",
    close: "✕",
    home: "🏠",
    "document-text": "📄",
    school: "🎓",
    people: "👥",
    shield: "🛡️",
    medal: "🏅",
    ribbon: "🎗️",
    "help-circle": "❓",
    library: "📚",
    "ellipsis-horizontal": "⋯",
    settings: "⚙️",
    exit: "🚪",
    "chevron-forward": "▶",
    folder: "📁",
    "chevron-back": "◀",
    upload: "📤",
    history: "📜",
    resolution: "📋",
    science: "🔬",
    economics: "📊",
    "qs-qp": "🏛️",
    culture: "🎭",
    law: "⚖️",
    decree: "📃",
    circular: "🔄",
    user: "👤",
    lock: "🔒",
    eye: "👁",
    "eye-off": "🙈",
    image: "🖼️",
    video: "🎥",
    download: "⬇️",
    edit: "✏️",
    training: "🎯",
    party: "🏛️",
    logout: "🚪",
  };

  const iconChar = iconMap[name] || "•";

  return (
    <Text style={{ fontSize: size, color, lineHeight: size }}>{iconChar}</Text>
  );
};

export default Icon;
