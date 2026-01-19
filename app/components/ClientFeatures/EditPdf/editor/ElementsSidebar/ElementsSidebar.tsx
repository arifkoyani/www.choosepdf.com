import { Type, Square, CheckSquare, Image, FileJson } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import type { Annotation } from '@/app/types/annotations';

interface ElementsSidebarProps {
  annotations: Annotation[];
  selectedId: string | null;
  onSelectAnnotation: (id: string) => void;
  onExportJson: () => void;
}

export function ElementsSidebar({
  annotations,
  selectedId,
  onSelectAnnotation,
  onExportJson,
}: ElementsSidebarProps) {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('annotation-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'TextField':
        return <Type className="h-4 w-4" />;
      case 'Checkbox':
        return <Square className="h-4 w-4" />;
      case 'CheckedCheckbox':
        return <CheckSquare className="h-4 w-4" />;
      case 'Image':
        return <Image className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4">
        <h2 className="font-semibold text-sm mb-3 text-gray-900">Elements</h2>
        <div className="grid grid-cols-2 gap-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'text')}
            className="group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#fff5f0] hover:bg-[#ff911d] cursor-grab transition-colors border border-gray-200"
          >
            <Type className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
            <span className="text-xs text-gray-700 group-hover:text-white transition-colors">Text</span>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'checkbox')}
            className="group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#fff5f0] hover:bg-[#ff911d] cursor-grab transition-colors border border-gray-200"
          >
            <Square className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
            <span className="text-xs text-gray-700 group-hover:text-white transition-colors">Checkbox</span>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'checkedCheckbox')}
            className="group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#fff5f0] hover:bg-[#ff911d] cursor-grab transition-colors border border-gray-200"
          >
            <CheckSquare className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
            <span className="text-xs text-gray-700 group-hover:text-white transition-colors">Checked</span>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'image')}
            className="group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#fff5f0] hover:bg-[#ff911d] cursor-grab transition-colors border border-gray-200"
          >
            <Image className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
            <span className="text-xs text-gray-700 group-hover:text-white transition-colors">Image</span>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <h2 className="font-semibold text-sm text-gray-900">Layers</h2>
        </div>
        <ScrollArea className="flex-1 px-4">
          {annotations.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">
              Drag elements to the PDF to add annotations
            </p>
          ) : (
            <div className="space-y-1 pb-4">
              {annotations.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => onSelectAnnotation(ann.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                    selectedId === ann.id
                      ? 'bg-[#ff911d] text-white'
                      : 'hover:bg-[#fff5f0] text-gray-700'
                  }`}
                >
                  {getIcon(ann.type)}
                  <span className="truncate">
                    {ann.type === 'TextField' ? (ann as any).text || 'Text' : ann.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator className="bg-gray-200" />

      <div className="p-4">
        <Button
          variant="secondary"
          className="w-full gap-2 bg-[#fff5f0] hover:bg-[#ff911d] hover:text-white text-gray-700 border border-gray-200"
          onClick={onExportJson}
        >
          <FileJson className="h-4 w-4" />
          Export JSON
        </Button>
      </div>
    </div>
  );
}
