import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Check, Square } from 'lucide-react';
import type { Annotation, TextFieldAnnotation, ImageAnnotation } from '@/app/types/annotations';
import { cn } from '../../../../lib/utils';

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
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

  const handleTextFieldClick = (e: React.MouseEvent) => {
    if (annotation.type === 'TextField' && !isEditing) {
      e.stopPropagation();
      const tf = annotation as TextFieldAnnotation;
      setIsEditing(true);
      setEditText(tf.text || '');
      onSelect();
    }
  };

  const handleTextBlur = () => {
    if (annotation.type === 'TextField' && isEditing) {
      onUpdate({ text: editText });
      setIsEditing(false);
      // Keep the annotation selected after editing
      if (!isSelected) {
        onSelect();
      }
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
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              className="w-full h-full px-1 outline-none border-none bg-transparent"
              style={{
                fontSize: `${tf.fontSize * scale}px`,
                fontFamily: tf.fontFamily,
                fontWeight: tf.fontBold ? 'bold' : 'normal',
                fontStyle: tf.fontItalic ? 'italic' : 'normal',
                textDecoration: tf.fontUnderline ? 'underline' : (tf.fontStrikeout ? 'line-through' : 'none'),
                color: tf.color,
                textAlign: tf.alignment,
                cursor: 'text',
              }}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center px-1 overflow-hidden select-none cursor-text"
            style={{
              fontSize: `${tf.fontSize * scale}px`,
              fontFamily: tf.fontFamily,
              fontWeight: tf.fontBold ? 'bold' : 'normal',
              fontStyle: tf.fontItalic ? 'italic' : 'normal',
              textDecoration: tf.fontUnderline ? 'underline' : (tf.fontStrikeout ? 'line-through' : 'none'),
              color: tf.color,
              textAlign: tf.alignment,
              justifyContent: tf.alignment === 'left' ? 'flex-start' : tf.alignment === 'center' ? 'center' : 'flex-end',
            }}
            onClick={handleTextFieldClick}
          >
            {tf.text || 'Click to edit'}
          </div>
        );
      }
      case 'Checkbox':
        return (
          <div className="w-full h-full flex items-center justify-center border-2 border-foreground/60 rounded-sm bg-white pointer-events-none">
            <Square className="w-3/4 h-3/4 text-transparent" />
          </div>
        );
      case 'CheckedCheckbox':
        return (
          <div className="w-full h-full flex items-center justify-center border-2 border-foreground/60 rounded-sm bg-white pointer-events-none">
            <Check className="w-3/4 h-3/4 text-foreground" strokeWidth={3} />
          </div>
        );
      case 'Image': {
        const img = annotation as ImageAnnotation;
        return (
          <img
            src={img.url}
            alt="Annotation"
            className="w-full h-full object-contain pointer-events-none select-none"
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
        if (annotation.type === 'TextField' && !isEditing) {
          // Allow click to edit
          return;
        }
        if (!isEditing) {
          e.stopPropagation();
          onSelect();
        }
      }}
      bounds="parent"
      default={{
        x: annotation.x * scale,
        y: annotation.y * scale,
        width: annotation.width * scale,
        height: annotation.height * scale,
      }}
      className={cn(
        'transition-shadow !touch-none',
        !isEditing && 'cursor-move',
        isSelected && 'ring-2 ring-primary ring-offset-1 z-10'
      )}
      style={{
        background: 'transparent',
        border: annotation.type === 'TextField' && isSelected ? '1px dashed hsl(var(--primary))' : 'none',
        cursor: isEditing ? 'text' : 'move',
      }}
      enableResizing={isSelected}
      disableDragging={isEditing}
      resizeHandleStyles={{
        bottomRight: { 
          width: 10, 
          height: 10, 
          background: 'hsl(var(--primary))', 
          borderRadius: 2,
          right: -5,
          bottom: -5,
        },
        bottomLeft: { 
          width: 10, 
          height: 10, 
          background: 'hsl(var(--primary))', 
          borderRadius: 2,
          left: -5,
          bottom: -5,
        },
        topRight: { 
          width: 10, 
          height: 10, 
          background: 'hsl(var(--primary))', 
          borderRadius: 2,
          right: -5,
          top: -5,
        },
        topLeft: { 
          width: 10, 
          height: 10, 
          background: 'hsl(var(--primary))', 
          borderRadius: 2,
          left: -5,
          top: -5,
        },
      }}
    >
      {renderContent()}
    </Rnd>
  );
}