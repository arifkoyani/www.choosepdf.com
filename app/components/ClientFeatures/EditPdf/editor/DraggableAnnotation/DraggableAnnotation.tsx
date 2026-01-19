import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Check, Square } from 'lucide-react';
import type { Annotation, TextFieldAnnotation, ImageAnnotation } from '@/app/types/annotations';
import { cn } from '@/app/components/lib/utils';

interface DraggableAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Annotation>) => void;
  scale: number;
}

export function DraggableAnnotation({
  annotation,
  isSelected,
  onSelect,
  onUpdate,
  scale,
}: DraggableAnnotationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
    onUpdate({ x: d.x / scale, y: d.y / scale });
  };

  const handleResizeStop = (
    _e: unknown,
    _direction: unknown,
    ref: HTMLElement,
    _delta: unknown,
    position: { x: number; y: number }
  ) => {
    onUpdate({
      width: ref.offsetWidth / scale,
      height: ref.offsetHeight / scale,
      x: position.x / scale,
      y: position.y / scale,
    });
  };

  const handleDoubleClick = () => {
    if (annotation.type === 'TextField') {
      const tf = annotation as TextFieldAnnotation;
      setIsEditing(true);
      setEditText(tf.text || '');
    }
  };

  const handleTextBlur = () => {
    if (annotation.type === 'TextField') {
      onUpdate({ text: editText });
      setIsEditing(false);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      const tf = annotation as TextFieldAnnotation;
      setEditText(tf.text || '');
    }
  };

  const renderContent = () => {
    switch (annotation.type) {
      case 'TextField': {
        const tf = annotation as TextFieldAnnotation;
        if (isEditing) {
          return (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              autoFocus
              className="w-full h-full px-1 outline-none border-none bg-transparent"
              style={{
                fontSize: `${tf.fontSize * scale}px`,
                fontFamily: tf.fontFamily,
                fontWeight: tf.fontWeight,
                fontStyle: tf.fontStyle,
                textDecoration: tf.textDecoration,
                color: '#000000',
              }}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center px-1 overflow-hidden"
            style={{
              fontSize: `${tf.fontSize * scale}px`,
              fontFamily: tf.fontFamily,
              fontWeight: tf.fontWeight,
              fontStyle: tf.fontStyle,
              textDecoration: tf.textDecoration,
              color: '#000000',
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onDoubleClick={handleDoubleClick}
          >
            {tf.text || 'Double-click to edit'}
          </div>
        );
      }
      case 'Checkbox':
        return (
          <div 
            className="w-full h-full flex items-center justify-center border-2 border-foreground/60 rounded-sm bg-white"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              pointerEvents: 'auto' 
            }}
          >
            <Square className="w-3/4 h-3/4 text-transparent" />
          </div>
        );
      case 'CheckedCheckbox':
        return (
          <div 
            className="w-full h-full flex items-center justify-center border-2 border-foreground/60 rounded-sm bg-white"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              pointerEvents: 'auto' 
            }}
          >
            <Check className="w-3/4 h-3/4 text-foreground" strokeWidth={3} />
          </div>
        );
      case 'Image': {
        const img = annotation as ImageAnnotation;
        return (
          <img
            src={img.url}
            alt="Annotation"
            className="w-full h-full object-contain"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              pointerEvents: 'auto' 
            }}
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">Image</text></svg>';
            }}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <Rnd
      position={{ x: annotation.x * scale, y: annotation.y * scale }}
      size={{ width: annotation.width * scale, height: annotation.height * scale }}
      onDragStart={() => {
        if (!isEditing) {
          onSelect();
        }
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onDoubleClick={handleDoubleClick}
      bounds="parent"
      disableDragging={isEditing}
      cancel=".no-drag"
      className={cn(
        'transition-shadow',
        !isEditing && 'cursor-move',
        isSelected && 'ring-2 ring-[#ff911d] ring-offset-1 z-10'
      )}
      style={{
        background: annotation.type === 'TextField' ? 'rgba(255, 145, 29, 0.1)' : 'transparent',
        border: annotation.type === 'TextField' ? '1px dashed #ff911d' : 'none',
      }}
      enableResizing={isSelected && !isEditing}
      resizeHandleStyles={{
        bottomRight: { 
          width: 10, 
          height: 10, 
          background: '#ff911d', 
          borderRadius: 2,
          right: -5,
          bottom: -5,
          border: '1px solid white',
        },
        bottomLeft: { 
          width: 10, 
          height: 10, 
          background: '#ff911d', 
          borderRadius: 2,
          left: -5,
          bottom: -5,
          border: '1px solid white',
        },
        topRight: { 
          width: 10, 
          height: 10, 
          background: '#ff911d', 
          borderRadius: 2,
          right: -5,
          top: -5,
          border: '1px solid white',
        },
        topLeft: { 
          width: 10, 
          height: 10, 
          background: '#ff911d', 
          borderRadius: 2,
          left: -5,
          top: -5,
          border: '1px solid white',
        },
      }}
    >
      {renderContent()}
    </Rnd>
  );
}
