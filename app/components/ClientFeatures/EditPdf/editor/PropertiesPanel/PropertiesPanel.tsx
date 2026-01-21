import { Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';  
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Toggle } from '@/app/components/ui/toggle';
import type { Annotation, TextFieldAnnotation, ImageAnnotation } from '@/app/types/annotations';

interface PropertiesPanelProps {
  selectedAnnotation: Annotation | null;
  onUpdate: (updates: Partial<Annotation>) => void;
  onDelete: () => void;
  onCropImage: () => void;
}

export function PropertiesPanel({ selectedAnnotation, onUpdate, onDelete, onCropImage }: PropertiesPanelProps) {
  if (!selectedAnnotation) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 flex flex-col shadow-sm">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Properties</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-600 text-center">
            Select an annotation to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const isTextField = selectedAnnotation.type === 'TextField';
  const isImage = selectedAnnotation.type === 'Image';
  const textField = selectedAnnotation as TextFieldAnnotation;
  const imageAnnotation = selectedAnnotation as ImageAnnotation;

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">Properties</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete} 
          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-gray-200" />

      {/* Position */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-gray-700">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">X</Label>
            <Input
              type="number"
              value={Math.round(selectedAnnotation.x)}
              onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedAnnotation.y)}
              onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-gray-700">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Width</Label>
            <Input
              type="number"
              value={Math.round(selectedAnnotation.width)}
              onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 50 })}
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Height</Label>
            <Input
              type="number"
              value={Math.round(selectedAnnotation.height)}
              onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 20 })}
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Text-specific properties */}
      {isTextField && (
        <>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Text Content</Label>
            <Input
              value={textField.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter text..."
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Font</Label>
            <Select
              value={textField.fontFamily}
              onValueChange={(value) => onUpdate({ fontFamily: value })}
            >
              <SelectTrigger className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="Helvetica" className="text-gray-900">Helvetica</SelectItem>
                <SelectItem value="Arial" className="text-gray-900">Arial</SelectItem>
                <SelectItem value="Times New Roman" className="text-gray-900">Times New Roman</SelectItem>
                <SelectItem value="Courier New" className="text-gray-900">Courier New</SelectItem>
                <SelectItem value="Georgia" className="text-gray-900">Georgia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Font Size</Label>
            <Input
              type="number"
              value={textField.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 14 })}
              min={8}
              max={72}
              className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Text Style</Label>
            <div className="flex gap-2 flex-wrap">
              <Toggle
                pressed={textField.fontBold}
                onPressedChange={(pressed) => onUpdate({ fontBold: pressed })}
                size="sm"
                aria-label="Bold"
                className="h-9 w-9 bg-white cursor-pointer border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-[#ff911d] data-[state=on]:text-white data-[state=on]:border-[#ff911d] data-[state=on]:shadow-md transition-all"
              >
                <span className="text-xs font-bold">B</span>
              </Toggle>
              <Toggle
                pressed={textField.fontItalic}
                onPressedChange={(pressed) => onUpdate({ fontItalic: pressed })}
                size="sm"
                aria-label="Italic"
                className="h-9 w-9 cursor-pointer bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-[#ff911d] data-[state=on]:text-white data-[state=on]:border-[#ff911d] data-[state=on]:shadow-md transition-all"
              >
                <span className="text-xs italic">I</span>
              </Toggle>
              <Toggle
                pressed={textField.fontUnderline}
                onPressedChange={(pressed) => onUpdate({ fontUnderline: pressed })}
                size="sm"
                aria-label="Underline"
                className="h-9 w-9 bg-white cursor-pointer border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-[#ff911d] data-[state=on]:text-white data-[state=on]:border-[#ff911d] data-[state=on]:shadow-md transition-all"
              >
                <span className="text-xs underline">U</span>
              </Toggle>
              <Toggle
                pressed={textField.fontStrikeout}
                onPressedChange={(pressed) => onUpdate({ fontStrikeout: pressed })}
                size="sm"
                aria-label="Strikeout"
                className="h-9 w-9 bg-white cursor-pointer border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-[#ff911d] data-[state=on]:text-white data-[state=on]:border-[#ff911d] data-[state=on]:shadow-md transition-all"
              >
                <span className="text-xs line-through">S</span>
              </Toggle>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={textField.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="h-8 w-16 border-gray-300 cursor-pointer"
              />
              <Input
                type="text"
                value={textField.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                placeholder="#000000"
                className="h-8 flex-1 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Alignment</Label>
            <Select
              value={textField.alignment}
              onValueChange={(value: 'left' | 'center' | 'right') => onUpdate({ alignment: value })}
            >
              <SelectTrigger className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="left" className="text-gray-900">Left</SelectItem>
                <SelectItem value="center" className="text-gray-900">Center</SelectItem>
                <SelectItem value="right" className="text-gray-900">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700">Transparent</Label>
            <Toggle
              pressed={textField.transparent}
              onPressedChange={(pressed) => onUpdate({ transparent: pressed })}
              size="sm"
              aria-label="Transparent"
              className="h-9 px-4 bg-white cursor-pointer border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 data-[state=on]:bg-[#ff911d] data-[state=on]:text-white data-[state=on]:border-[#ff911d] data-[state=on]:shadow-md transition-all"
            >
              <span className="text-xs">{textField.transparent ? 'Yes' : 'No'}</span>
            </Toggle>
          </div>
        </>
      )}

      {/* Image-specific properties */}
      {isImage && (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700">Image</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCropImage}
              className="h-9 w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Crop Image
            </Button>
          </div>

          <Label className="text-xs font-medium text-gray-700">Image URL</Label>
          <Input
            value={imageAnnotation.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://example.com/image.png"
            className="h-8 border-gray-300 text-gray-900 focus:border-[#ff911d] focus:ring-[#ff911d]"
          />
        </div>
      )}

      {/* Checkbox info */}
      {(selectedAnnotation.type === 'Checkbox' || selectedAnnotation.type === 'CheckedCheckbox') && (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700">State</Label>
          <p className="text-sm text-gray-900">
            {selectedAnnotation.type === 'CheckedCheckbox' ? 'Checked' : 'Unchecked'}
          </p>
        </div>
      )}
    </div>
  );
}
